"""
Process Kaggle TMDB 5000 dataset and insert into Oracle 26ai movie_search table.

This script:
1. Loads and merges the two CSV files on 'id' column
2. Creates a 'search_blob' column combining title, overview, and keywords
3. Uses sentence-transformers (all-MiniLM-L6-v2) to create 384-dim vectors
4. Connects to Oracle 26ai using Thin mode and inserts movies into movie_search table
5. Adds 5 manual YouTube Clips entries

Requires environment variables:
- ORACLE_USER: Database username
- ORACLE_PASSWORD: Database password
- ORACLE_TNS: TNS name (default: movierecdb_tp) or full connection string
"""

import pandas as pd
import oracledb
import json
import os
from typing import List, Tuple
import numpy as np

# Thin mode is the default in python-oracledb
# No need to call init_oracle_client() for Thin mode
# If you need Thick mode, uncomment: oracledb.init_oracle_client()

# Lazy import of sentence_transformers (only needed for create_embeddings)
_model = None

def get_model():
    """Lazy load sentence transformer model (only when needed for embeddings)."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("Loading sentence transformer model...")
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            print("Model loaded successfully!")
        except ImportError:
            raise ImportError("sentence-transformers is required for creating embeddings. Install it with: pip install sentence-transformers")
    return _model

def load_config():
    """Load configuration from config.env file or environment variables."""
    config = {}
    
    # Try to load from config.env file first
    config_file = 'config.env'
    if os.path.exists(config_file):
        print(f"Loading configuration from {config_file}...")
        with open(config_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
        print("Configuration loaded from file.")
    else:
        print("config.env not found, using environment variables...")
    
    # Override with environment variables if they exist
    config['ORACLE_USER'] = os.getenv('ORACLE_USER', config.get('ORACLE_USER', ''))
    config['ORACLE_PASSWORD'] = os.getenv('ORACLE_PASSWORD', config.get('ORACLE_PASSWORD', ''))
    config['ORACLE_TNS'] = os.getenv('ORACLE_TNS', config.get('ORACLE_TNS', 'movierecdb_tp'))
    config['TNS_ADMIN'] = os.getenv('TNS_ADMIN', config.get('TNS_ADMIN', ''))
    
    return config

# Model is now loaded lazily via get_model() function
# This allows process_kaggle.py to be imported without sentence-transformers
# if only connection/config functions are needed

def parse_json_field(field: str) -> str:
    """Parse JSON string field and extract names/values."""
    if pd.isna(field) or field == '':
        return ''
    try:
        data = json.loads(field)
        if isinstance(data, list):
            # Extract 'name' field from each item
            names = [item.get('name', '') for item in data if isinstance(item, dict)]
            return ', '.join(names)
        return str(data)
    except (json.JSONDecodeError, TypeError):
        return str(field) if field else ''

def create_search_blob(row: pd.Series) -> str:
    """Create search blob from title, overview, and keywords."""
    parts = []
    
    # Title
    if pd.notna(row.get('title')):
        parts.append(str(row['title']))
    
    # Overview
    if pd.notna(row.get('overview')):
        parts.append(str(row['overview']))
    
    # Keywords
    keywords = parse_json_field(row.get('keywords', ''))
    if keywords:
        parts.append(keywords)
    
    return ' '.join(parts)

def load_and_merge_data() -> pd.DataFrame:
    """Load and merge the two CSV files."""
    print("Loading CSV files...")
    
    # Load movies CSV
    movies_df = pd.read_csv('db/tmdb_5000_movies.csv')
    print(f"Loaded {len(movies_df)} movies")
    
    # Load credits CSV
    credits_df = pd.read_csv('db/tmdb_5000_credits.csv')
    print(f"Loaded {len(credits_df)} credits")
    
    # Merge on id (credits has movie_id, movies has id)
    # Rename movie_id to id in credits for merging
    credits_df = credits_df.rename(columns={'movie_id': 'id'})
    
    # Merge the dataframes
    merged_df = pd.merge(movies_df, credits_df, on='id', how='inner')
    print(f"Merged dataset has {len(merged_df)} movies")
    
    # Fix duplicate title columns created by merge (title_x and title_y)
    # Pandas creates title_x and title_y when both dataframes have 'title' column
    if 'title_x' in merged_df.columns or 'title_y' in merged_df.columns:
        print("Fixing duplicate title columns from merge...")
        # Use title_x if it exists (from movies_df), otherwise use title_y (from credits_df)
        if 'title_x' in merged_df.columns:
            merged_df['title'] = merged_df['title_x']
        elif 'title_y' in merged_df.columns:
            merged_df['title'] = merged_df['title_y']
        
        # Drop the duplicate title columns
        columns_to_drop = [col for col in ['title_x', 'title_y'] if col in merged_df.columns]
        if columns_to_drop:
            merged_df.drop(columns=columns_to_drop, inplace=True)
            print(f"Dropped duplicate columns: {columns_to_drop}")
    
    # Ensure no null titles - fill with 'Unknown Title'
    merged_df['title'] = merged_df['title'].fillna('Unknown Title')
    null_titles_count = merged_df['title'].isna().sum()
    if null_titles_count > 0:
        print(f"Warning: {null_titles_count} rows still have null titles after fillna")
    
    print(f"Title column fixed. Non-null titles: {merged_df['title'].notna().sum()}/{len(merged_df)}")
    
    return merged_df

def create_embeddings(search_blobs: List[str], batch_size: int = 32) -> np.ndarray:
    """Create embeddings for search blobs using sentence-transformers."""
    model = get_model()  # Lazy load model only when needed
    print(f"Creating embeddings for {len(search_blobs)} items...")
    embeddings = model.encode(search_blobs, batch_size=batch_size, show_progress_bar=True)
    print(f"Created embeddings with shape: {embeddings.shape}")
    return embeddings

def get_oracle_connection():
    """Get Oracle database connection using movierecdb_tp TNS name in Thin mode."""
    # Load configuration
    config = load_config()
    username = config.get('ORACLE_USER')
    password = config.get('ORACLE_PASSWORD')
    tns_name = config.get('ORACLE_TNS', 'movierecdb_tp')
    wallet_path = config.get('TNS_ADMIN', '')
    
    # Alternative: check for full connection string
    full_conn_str = os.getenv('ORACLE_CONNECTION_STRING')
    
    if full_conn_str:
        # Use full connection string if provided
        try:
            connection = oracledb.connect(full_conn_str)
            print("Connected to Oracle database successfully (using full connection string)!")
            return connection
        except Exception as e:
            print(f"Error connecting with full connection string: {e}")
            raise
    
    if not username or not password:
        raise ValueError(
            "Oracle credentials not found!\n\n"
            "Please create a 'config.env' file with:\n"
            "  ORACLE_USER=your_username\n"
            "  ORACLE_PASSWORD=your_password\n"
            "  ORACLE_TNS=movierecdb_tp\n"
            "  TNS_ADMIN=path/to/wallet\n\n"
            "Or set environment variables:\n"
            "  ORACLE_USER, ORACLE_PASSWORD, ORACLE_TNS, TNS_ADMIN"
        )
    
    # TNS descriptions for Oracle Cloud (provided by user)
    tns_descriptions = {
        'movierecdb_tp': '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-hyderabad-1.oraclecloud.com))(connect_data=(service_name=g79c5351b32a34f_movierecdb_tp.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))',
        'movierecdb_high': '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-hyderabad-1.oraclecloud.com))(connect_data=(service_name=g79c5351b32a34f_movierecdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))',
        'movierecdb_medium': '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-hyderabad-1.oraclecloud.com))(connect_data=(service_name=g79c5351b32a34f_movierecdb_medium.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))',
        'movierecdb_low': '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-hyderabad-1.oraclecloud.com))(connect_data=(service_name=g79c5351b32a34f_movierecdb_low.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))',
        'movierecdb_tpurgent': '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-hyderabad-1.oraclecloud.com))(connect_data=(service_name=g79c5351b32a34f_movierecdb_tpurgent.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
    }
    
    # Get TNS description
    tns_desc = tns_descriptions.get(tns_name.lower())
    
    if not tns_desc:
        raise ValueError(f"TNS name '{tns_name}' not found in known TNS descriptions.")
    
    # Extract connection details from TNS description
    import re
    
    # Extract host, port, and service_name from TNS description
    host_match = re.search(r'host=([^)]+)', tns_desc)
    port_match = re.search(r'port=(\d+)', tns_desc)
    service_match = re.search(r'service_name=([^)]+)', tns_desc)
    
    if not (host_match and port_match and service_match):
        raise ValueError(f"Could not parse TNS description for {tns_name}")
    
    host = host_match.group(1)
    port = int(port_match.group(1))
    service_name = service_match.group(1)
    
    # Check if SSL is required (protocol=tcps)
    use_ssl = 'protocol=tcps' in tns_desc.lower() or 'tcps' in tns_desc.lower()
    
    print(f"Connecting to Oracle Cloud:")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print(f"  Service: {service_name}")
    print(f"  SSL: {use_ssl}")
    
    # Try multiple connection methods for Oracle Cloud
    connection_methods = []
    
    # Use wallet path from config
    if not wallet_path:
        wallet_path = os.getenv('TNS_ADMIN') or os.getenv('ORACLE_WALLET')
    
    if wallet_path and os.path.exists(wallet_path):
        # Method 1: Use TNS name from wallet's tnsnames.ora
        try:
            conn_str = f"{username}/{password}@{tns_name}"
            connection = oracledb.connect(conn_str, config_dir=wallet_path)
            print(f"[SUCCESS] Connected using wallet TNS name: {tns_name}")
            return connection
        except Exception as e1:
            error_msg = str(e1)[:200]
            connection_methods.append(f"Wallet TNS: {error_msg}")
            print(f"Method 1 (Wallet TNS) failed: {error_msg}")
    
    if use_ssl:
        # Method 1b: Use full TNS description in connection string (if no wallet)
        try:
            conn_str = f"{username}/{password}@{tns_desc}"
            connection = oracledb.connect(conn_str)
            print(f"[SUCCESS] Connected using TNS description")
            return connection
        except Exception as e1:
            error_msg = str(e1)[:200]
            connection_methods.append(f"TNS description: {error_msg}")
            print(f"Method 1b failed: {error_msg}")
    
    # Method 2: Create DSN with SSL configuration
    try:
        dsn = oracledb.makedsn(host=host, port=port, service_name=service_name)
        
        # Use wallet path from config
        if wallet_path and os.path.exists(wallet_path):
            # Use wallet for SSL with DSN
            connection = oracledb.connect(
                user=username,
                password=password,
                dsn=dsn,
                config_dir=wallet_path
            )
            print(f"[SUCCESS] Connected using wallet DSN")
            return connection
        else:
            # Try without wallet (Thin mode should handle SSL)
            connection = oracledb.connect(
                user=username,
                password=password,
                dsn=dsn,
                ssl_context=None  # Let Thin mode handle SSL
            )
            print(f"[SUCCESS] Connected using DSN (SSL auto-configured)")
            return connection
    except Exception as e2:
        error_msg = str(e2)[:200]
        connection_methods.append(f"DSN connection: {error_msg}")
        print(f"Method 2 failed: {error_msg}")
    
    # Method 3: Try with explicit SSL parameters (for testing without wallet)
    if use_ssl:
        try:
            import ssl
            # Create SSL context that doesn't verify certificates (for testing)
            # In production, use proper wallet certificates
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            dsn = oracledb.makedsn(host=host, port=port, service_name=service_name)
            connection = oracledb.connect(
                user=username,
                password=password,
                dsn=dsn,
                ssl_context=ssl_context
            )
            print(f"[SUCCESS] Connected using SSL context (certificate verification disabled)")
            return connection
        except Exception as e3:
            error_msg = str(e3)[:200]
            connection_methods.append(f"SSL context: {error_msg}")
            print(f"Method 3 failed: {error_msg}")
    
    # If all methods failed, provide detailed error
    print(f"\n[ERROR] All connection methods failed:")
    for method in connection_methods:
        print(f"  - {method}")
    
    print(f"\nConnection details:")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print(f"  Service: {service_name}")
    print(f"  Username: {username}")
    print(f"  SSL Required: {use_ssl}")
    
    print(f"\nSolutions:")
    print(f"  1. Download Oracle Cloud wallet and set TNS_ADMIN or ORACLE_WALLET environment variable")
    print(f"  2. Verify your IP is whitelisted in Oracle Cloud Network Security")
    print(f"  3. Check if credentials are correct")
    print(f"  4. Ensure network connectivity to {host}:{port}")
    print(f"  5. Try using a different TNS name (high/medium/low)")
    
    raise ConnectionError(f"Could not connect to Oracle Cloud database after trying {len(connection_methods)} methods")
    

def create_movie_search_table(connection):
    """Create movie_search table if it doesn't exist."""
    cursor = connection.cursor()
    
    # Check if table exists
    cursor.execute("""
        SELECT COUNT(*) FROM user_tables WHERE table_name = 'MOVIE_SEARCH'
    """)
    table_exists = cursor.fetchone()[0] > 0
    
    if not table_exists:
        print("Creating movie_search table...")
        # Oracle 26ai supports VECTOR data type for embeddings
        # VECTOR(384) stores 384-dimensional vectors (from all-MiniLM-L6-v2)
        try:
            # Oracle 26ai supports VECTOR data type for embeddings
            # VECTOR(384) stores 384-dimensional vectors (from all-MiniLM-L6-v2)
            cursor.execute("""
                CREATE TABLE movie_search (
                    id NUMBER PRIMARY KEY,
                    title VARCHAR2(500),
                    search_blob CLOB,
                    embedding VECTOR(384),
                    description CLOB,
                    url VARCHAR2(1000),
                    content_type VARCHAR2(50) DEFAULT 'Movie',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            connection.commit()
            print("Table created successfully with VECTOR(384) embedding column!")
        except Exception as e:
            error_msg = str(e).upper()
            if 'VECTOR' in error_msg or 'INVALID' in error_msg:
                print(f"Error creating table with VECTOR type: {e}")
                print("This might indicate Oracle 26ai VECTOR support is not available.")
                print("Please ensure you're using Oracle Database 23ai or later with VECTOR support.")
                raise
            else:
                # Re-raise if it's a different error
                raise
    else:
        print("Table movie_search already exists.")
        # Check if table has data
        cursor.execute("SELECT COUNT(*) FROM movie_search")
        count = cursor.fetchone()[0]
        if count > 0:
            print(f"Warning: Table already contains {count} records.")
            print("Note: This script will attempt to insert movies. Duplicate IDs will cause errors.")
            # Check for duplicate IDs before inserting
            skip_duplicates = os.getenv('SKIP_DUPLICATES', 'false').lower() == 'true'
            if skip_duplicates:
                print("SKIP_DUPLICATES is set - will skip existing movie IDs.")
    
    cursor.close()

def insert_movies(connection, movies_data: List[Tuple], embeddings: np.ndarray):
    """Insert movies into the movie_search table."""
    cursor = connection.cursor()
    
    print(f"Inserting {len(movies_data)} movies...")
    
    # Check for existing IDs if SKIP_DUPLICATES is set
    skip_duplicates = os.getenv('SKIP_DUPLICATES', 'false').lower() == 'true'
    existing_ids = set()
    if skip_duplicates:
        cursor.execute("SELECT id FROM movie_search")
        existing_ids = {row[0] for row in cursor.fetchall()}
        print(f"Found {len(existing_ids)} existing records. Will skip duplicates.")
    
    # Prepare data for batch insert using executemany
    # Oracle 26ai VECTOR type requires string format for TO_VECTOR function
    insert_sql = """
        INSERT INTO movie_search (id, title, search_blob, embedding, description, content_type)
        VALUES (:1, :2, :3, TO_VECTOR(:4), :5, :6)
    """
    
    # Prepare all rows for insertion
    all_rows_to_insert = []
    for i, (movie_id, title, search_blob, overview) in enumerate(movies_data):
        # Skip if duplicate and SKIP_DUPLICATES is enabled
        if skip_duplicates and int(movie_id) in existing_ids:
            continue
        
        # Get embedding as numpy array
        embedding_vector = embeddings[i]
        
        # Ensure the vector has exactly 384 dimensions (all-MiniLM-L6-v2 produces 384-dim vectors)
        if len(embedding_vector) != 384:
            raise ValueError(f"Expected 384 dimensions, got {len(embedding_vector)}")
        
        # Convert numpy array to list, then to string format for Oracle TO_VECTOR function
        # Format: '[val1, val2, val3, ...]'
        embedding_list = embedding_vector.tolist()
        embedding_str = str(embedding_list)  # Convert list to string format '[val1, val2, ...]'
        
        # Handle overview - convert float/NaN to string
        overview_str = str(overview) if pd.notna(overview) and overview else None
        if overview_str and isinstance(overview_str, str):
            overview_str = overview_str[:4000]
        
        # Ensure title is a valid string (not None, not NaN, not empty)
        title_str = None
        if title is not None:
            if isinstance(title, str):
                title_str = title[:500] if title.strip() else 'Unknown Title'
            else:
                title_str = str(title)[:500] if str(title).strip() else 'Unknown Title'
        else:
            title_str = 'Unknown Title'
        
        all_rows_to_insert.append((
            int(movie_id),
            title_str,  # Ensure title is always a valid string
            str(search_blob)[:4000] if search_blob and pd.notna(search_blob) else None,  # CLOB can be larger, but limit for safety
            embedding_str,  # String format for TO_VECTOR function
            overview_str,
            'Movie'
        ))
    
    if len(all_rows_to_insert) == 0:
        print("No rows to insert (all duplicates skipped).")
        cursor.close()
        return
    
    # Use executemany for efficient batch insertion
    batch_size = 1000  # Larger batch size for executemany
    total_inserted = 0
    
    try:
        for i in range(0, len(all_rows_to_insert), batch_size):
            batch = all_rows_to_insert[i:i+batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(all_rows_to_insert) + batch_size - 1) // batch_size
            
            print(f"Inserting batch {batch_num}/{total_batches} ({len(batch)} rows)...")
            
            try:
                cursor.executemany(insert_sql, batch)
                # Commit immediately after each batch to ensure data is saved
                connection.commit()
                
                # Report row count
                rows_inserted = cursor.rowcount
                total_inserted += rows_inserted
                print(f"Batch {batch_num} completed: {rows_inserted} rows inserted (Total: {total_inserted})")
                
            except Exception as batch_error:
                print(f"Error inserting batch {batch_num}: {batch_error}")
                connection.rollback()
                # Try inserting one by one to identify problematic rows
                print(f"Attempting individual inserts for batch {batch_num}...")
                individual_count = 0
                for row in batch:
                    try:
                        cursor.execute(insert_sql, row)
                        individual_count += 1
                    except Exception as row_error:
                        print(f"  Error inserting row (ID: {row[0]}): {row_error}")
                        continue
                connection.commit()
                total_inserted += individual_count
                print(f"Batch {batch_num} completed with individual inserts: {individual_count} rows inserted (Total: {total_inserted})")
        
        print(f"\nAll movies inserted successfully! Total rows inserted: {total_inserted}")
        
    except Exception as e:
        print(f"Error during batch insertion: {e}")
        connection.rollback()
        raise
    finally:
        cursor.close()

def insert_youtube_clips(connection):
    """Insert 5 manual YouTube Clips entries."""
    cursor = connection.cursor()
    
    youtube_clips = [
        {
            'title': 'Best Movie Trailers 2024',
            'description': 'A compilation of the most exciting movie trailers from 2024, featuring action, drama, and comedy films.',
            'url': 'https://www.youtube.com/watch?v=example1'
        },
        {
            'title': 'Classic Movie Moments',
            'description': 'Iconic scenes from classic cinema that have stood the test of time, including dramatic monologues and unforgettable action sequences.',
            'url': 'https://www.youtube.com/watch?v=example2'
        },
        {
            'title': 'Sci-Fi Movie Compilation',
            'description': 'The best science fiction movie clips featuring space exploration, futuristic technology, and alien encounters.',
            'url': 'https://www.youtube.com/watch?v=example3'
        },
        {
            'title': 'Comedy Movie Highlights',
            'description': 'Funniest moments from popular comedy movies that will make you laugh out loud.',
            'url': 'https://www.youtube.com/watch?v=example4'
        },
        {
            'title': 'Thriller Movie Scenes',
            'description': 'Heart-pounding scenes from the best thriller movies, featuring suspense, mystery, and intense action.',
            'url': 'https://www.youtube.com/watch?v=example5'
        }
    ]
    
    print("Creating embeddings for YouTube clips...")
    clip_descriptions = [f"{clip['title']} {clip['description']}" for clip in youtube_clips]
    clip_embeddings = model.encode(clip_descriptions, show_progress_bar=True)
    
    print("Inserting YouTube clips...")
    
    # Get the next ID (using max+1)
    cursor.execute("SELECT NVL(MAX(id), 0) FROM movie_search")
    max_id = cursor.fetchone()[0]
    
    insert_sql = """
        INSERT INTO movie_search (id, title, search_blob, embedding, description, url, content_type)
        VALUES (:1, :2, :3, TO_VECTOR(:4), :5, :6, 'YouTube Clips')
    """
    
    rows_to_insert = []
    for i, clip in enumerate(youtube_clips):
        search_blob = f"{clip['title']} {clip['description']}"
        embedding_vector = clip_embeddings[i]
        
        # Ensure the vector has exactly 384 dimensions
        if len(embedding_vector) != 384:
            raise ValueError(f"Expected 384 dimensions, got {len(embedding_vector)}")
        
        # Convert numpy array to list, then to string format for Oracle TO_VECTOR function
        embedding_list = embedding_vector.tolist()
        embedding_str = str(embedding_list)  # Convert list to string format '[val1, val2, ...]'
        
        rows_to_insert.append((
            max_id + i + 1,  # Use sequential IDs starting from max+1
            clip['title'],
            search_blob,
            embedding_str,  # String format for TO_VECTOR function
            clip['description'],
            clip['url']
        ))
    
    try:
        # Use executemany for efficient batch insertion
        print(f"Inserting {len(rows_to_insert)} YouTube clips...")
        cursor.executemany(insert_sql, rows_to_insert)
        
        # Commit immediately after insert to ensure data is saved
        connection.commit()
        
        # Report row count
        rows_inserted = cursor.rowcount
        print(f"YouTube clips inserted successfully! Rows inserted: {rows_inserted}/{len(rows_to_insert)}")
        
    except Exception as e:
        print(f"Error inserting YouTube clips: {e}")
        connection.rollback()
        raise
    
    cursor.close()

def main():
    """Main processing function."""
    print("=" * 60)
    print("Kaggle TMDB 5000 Dataset Processing")
    print("=" * 60)
    
    try:
        # Step 1: Load and merge data
        merged_df = load_and_merge_data()
        
        # Step 2: Create search_blob column
        print("\nCreating search_blob column...")
        merged_df['search_blob'] = merged_df.apply(create_search_blob, axis=1)
        print(f"Created search_blob for {len(merged_df)} movies")
        
        # Debug: Print first 5 rows to verify titles are present
        print("\n" + "=" * 60)
        print("DEBUG: First 5 rows of merged dataframe (id and title):")
        print("=" * 60)
        print(merged_df[['id', 'title']].head())
        print("=" * 60)
        
        # Step 3: Create embeddings (or load from disk if available)
        embeddings_file = 'embeddings.npy'
        if os.path.exists(embeddings_file):
            print(f"\nLoading embeddings from {embeddings_file}...")
            embeddings = np.load(embeddings_file)
            print(f"Loaded embeddings with shape: {embeddings.shape}")
        else:
            print("\nCreating embeddings...")
            search_blobs = merged_df['search_blob'].fillna('').tolist()
            embeddings = create_embeddings(search_blobs)
            
            # Save embeddings to disk for reuse
            print(f"\nSaving embeddings to {embeddings_file} for reuse...")
            np.save(embeddings_file, embeddings)
            print(f"Embeddings saved successfully!")
        
        # Step 4: Connect to Oracle
        print("\nConnecting to Oracle database...")
        try:
            connection = get_oracle_connection()
        except Exception as conn_error:
            print(f"\n[WARNING] Connection failed, but embeddings are saved to {embeddings_file}")
            print(f"You can load them later with: embeddings = np.load('{embeddings_file}')")
            print(f"\nTo retry connection, fix the connection issues and run the script again.")
            print(f"The embeddings will be reused automatically if the file exists.")
            raise
        
        # Step 5: Create table if needed
        create_movie_search_table(connection)
        
        # Step 6: Prepare data for insertion
        print("\nPreparing data for insertion...")
        movies_data = []
        for _, row in merged_df.iterrows():
            # Explicitly get title - should be fixed after merge
            title = row.get('title', '') if 'title' in row else row.get('title_x', row.get('title_y', 'Unknown Title'))
            # Ensure title is not null/NaN
            if pd.isna(title) or title == '':
                title = 'Unknown Title'
            
            movies_data.append((
                row['id'],
                str(title),  # Explicitly convert to string
                row.get('search_blob', ''),
                row.get('overview', '')
            ))
        
        # Debug: Print first few titles from movies_data
        print(f"\nDEBUG: Sample titles from movies_data (first 5):")
        for i, (movie_id, title, _, _) in enumerate(movies_data[:5]):
            print(f"  ID: {movie_id}, Title: '{title}'")
        
        # Step 7: Insert movies
        print("\nInserting movies into database...")
        insert_movies(connection, movies_data, embeddings)
        
        # Step 8: Insert YouTube clips
        print("\nInserting YouTube clips...")
        insert_youtube_clips(connection)
        
        # Close connection
        connection.close()
        print("\n" + "=" * 60)
        print("Processing completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError during processing: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    main()

