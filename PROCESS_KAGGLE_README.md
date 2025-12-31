# Kaggle TMDB 5000 Dataset Processing

This script processes the Kaggle TMDB 5000 dataset and inserts it into Oracle 26ai for hybrid search capabilities.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set credentials
export ORACLE_USER="your_username"
export ORACLE_PASSWORD="your_password"

# 3. Run the script
python process_kaggle.py
```

The script will:
- Merge movies and credits CSVs on `id`
- Create `search_blob` from Title + Overview + Keywords
- Generate 384-dim vectors using all-MiniLM-L6-v2
- Batch-insert into Oracle 26ai with VECTOR(384) type

## Prerequisites

1. **Python 3.8+** installed
2. **Oracle 26ai Database** with connection access
3. **Connection String** (`movierecdb_tp`) configured

## Installation

1. Install required Python packages:
```bash
pip install -r requirements.txt
```

This will install:
- `pandas` - For CSV processing
- `oracledb` - Oracle database driver
- `sentence-transformers` - For creating embeddings
- `numpy` - For numerical operations

## Setup

### 1. Set Oracle Connection Credentials

The script uses **python-oracledb in Thin mode** (no Oracle Client required). Set your credentials:

**Windows (PowerShell):**
```powershell
$env:ORACLE_USER = "your_username"
$env:ORACLE_PASSWORD = "your_password"
$env:ORACLE_TNS = "movierecdb_tp"  # Optional, defaults to movierecdb_tp
```

**Windows (CMD):**
```cmd
set ORACLE_USER=your_username
set ORACLE_PASSWORD=your_password
set ORACLE_TNS=movierecdb_tp
```

**Linux/Mac:**
```bash
export ORACLE_USER="your_username"
export ORACLE_PASSWORD="your_password"
export ORACLE_TNS="movierecdb_tp"  # Optional, defaults to movierecdb_tp
```

**Alternative: Full Connection String**
If you prefer a full connection string:
```bash
export ORACLE_CONNECTION_STRING="user/password@(description=...)"
```

**Note:** The script includes TNS descriptions for:
- `movierecdb_tp` (default)
- `movierecdb_high`
- `movierecdb_medium`
- `movierecdb_low`
- `movierecdb_tpurgent`

### 2. Verify CSV Files

Ensure the CSV files are in the `db/` directory:
- `db/tmdb_5000_movies.csv`
- `db/tmdb_5000_credits.csv`

## Usage

Run the script:

```bash
python process_kaggle.py
```

### Optional: Skip Duplicates

If the table already contains data and you want to skip existing movie IDs:

```bash
# Windows
set SKIP_DUPLICATES=true
python process_kaggle.py

# Linux/Mac
export SKIP_DUPLICATES=true
python process_kaggle.py
```

## What the Script Does

1. **Loads and Merges Data**
   - Loads both CSV files
   - Merges them on the `id` column (movies CSV) and `movie_id` column (credits CSV)

2. **Creates Search Blob**
   - Combines `title`, `overview`, and `keywords` into a `search_blob` column
   - Parses JSON fields (keywords) to extract readable text

3. **Generates Embeddings**
   - Uses `all-MiniLM-L6-v2` model from sentence-transformers
   - Creates 384-dimensional vectors for each search_blob
   - Processes in batches for efficiency
   - Vectors are stored in Oracle 26ai VECTOR(384) data type

4. **Database Operations**
   - Connects to Oracle 26ai using **Thin mode** (no Oracle Client required)
   - Uses TNS name `movierecdb_tp` (or specified ORACLE_TNS)
   - Creates `movie_search` table if it doesn't exist with VECTOR(384) column
   - Batch-inserts all movies with their embeddings
   - Adds 5 manual YouTube Clips entries for hybrid search

## Database Schema

The script creates the following table structure:

```sql
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
```

## YouTube Clips

The script automatically adds 5 YouTube Clips entries:
1. Best Movie Trailers 2024
2. Classic Movie Moments
3. Sci-Fi Movie Compilation
4. Comedy Movie Highlights
5. Thriller Movie Scenes

These entries have `content_type = 'YouTube Clips'` and include URLs for hybrid search functionality.

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Verify your credentials: `ORACLE_USER` and `ORACLE_PASSWORD` are set correctly
2. Check that `ORACLE_TNS` matches one of the supported TNS names
3. Verify network connectivity to Oracle Cloud (adb.ap-hyderabad-1.oraclecloud.com:1522)
4. Ensure SSL/TLS is working (the connection uses `tcps` protocol)
5. Check firewall rules allow outbound connections on port 1522

### Vector Type Issues

If you encounter errors with VECTOR type:
- Ensure you're using Oracle Database 23ai or later (which supports VECTOR data type)
- The embedding dimension is fixed at 384 (from all-MiniLM-L6-v2 model)
- VECTOR(384) column is created automatically - ensure your Oracle version supports it

### Memory Issues

For large datasets:
- The script processes embeddings in batches
- If you run out of memory, reduce the `batch_size` parameter in `create_embeddings()` function

## Output

The script will print progress information:
- Number of movies loaded
- Embedding creation progress
- Database insertion progress
- Success confirmation

## Notes

- The first run will download the `all-MiniLM-L6-v2` model (~90MB) - this is a one-time download
- Processing ~5000 movies may take 10-30 minutes depending on your hardware
- The script will skip table creation if `movie_search` already exists
- Movie IDs from the CSV are preserved in the database

