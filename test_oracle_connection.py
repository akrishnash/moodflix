"""
Simple script to test Oracle Cloud connection.
Run this to diagnose connection issues.
"""

import oracledb
import os
import sys

def load_config():
    """Load configuration from config.env file or environment variables."""
    config = {}
    
    # Try to load from config.env file first
    config_file = 'config.env'
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
    
    # Override with environment variables if they exist
    config['ORACLE_USER'] = os.getenv('ORACLE_USER', config.get('ORACLE_USER', ''))
    config['ORACLE_PASSWORD'] = os.getenv('ORACLE_PASSWORD', config.get('ORACLE_PASSWORD', ''))
    config['ORACLE_TNS'] = os.getenv('ORACLE_TNS', config.get('ORACLE_TNS', 'movierecdb_tp'))
    config['TNS_ADMIN'] = os.getenv('TNS_ADMIN', config.get('TNS_ADMIN', ''))
    
    return config

config = load_config()
username = config.get('ORACLE_USER', 'ADMIN')
password = config.get('ORACLE_PASSWORD', '')
tns_name = config.get('ORACLE_TNS', 'movierecdb_tp')
wallet_path = config.get('TNS_ADMIN', '')

if not password:
    print("ERROR: ORACLE_PASSWORD not set in config.env or environment variables")
    print("\nPlease create a config.env file with:")
    print("  ORACLE_USER=ADMIN")
    print("  ORACLE_PASSWORD=your_password")
    print("  ORACLE_TNS=movierecdb_tp")
    print("  TNS_ADMIN=path/to/wallet")
    sys.exit(1)

# TNS description
tns_desc = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-hyderabad-1.oraclecloud.com))(connect_data=(service_name=g79c5351b32a34f_movierecdb_tp.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'

print("=" * 60)
print("Oracle Cloud Connection Test")
print("=" * 60)
print(f"Username: {username}")
print(f"TNS: {tns_name}")
print(f"Host: adb.ap-hyderabad-1.oraclecloud.com")
print(f"Port: 1522")
print()

# Test 1: Simple connection string
print("Test 1: Connection string with TNS description...")
try:
    conn_str = f"{username}/{password}@{tns_desc}"
    conn = oracledb.connect(conn_str)
    print("[SUCCESS] Connected using connection string!")
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM DUAL")
    result = cursor.fetchone()
    print(f"Database query successful: {result}")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"[FAILED] {str(e)[:200]}")

# Test 2: DSN method
print("\nTest 2: DSN method...")
try:
    dsn = oracledb.makedsn(
        host='adb.ap-hyderabad-1.oraclecloud.com',
        port=1522,
        service_name='g79c5351b32a34f_movierecdb_tp.adb.oraclecloud.com'
    )
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("[SUCCESS] Connected using DSN!")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"[FAILED] {str(e)[:200]}")

# Test 3: Check for wallet
print("\nTest 3: Checking for wallet...")
if not wallet_path:
    wallet_path = os.getenv('TNS_ADMIN') or os.getenv('ORACLE_WALLET')
if wallet_path and os.path.exists(wallet_path):
    print(f"Found wallet at: {wallet_path}")
    try:
        dsn = oracledb.makedsn(
            host='adb.ap-hyderabad-1.oraclecloud.com',
            port=1522,
            service_name='g79c5351b32a34f_movierecdb_tp.adb.oraclecloud.com'
        )
        conn = oracledb.connect(
            user=username,
            password=password,
            dsn=dsn,
            config_dir=wallet_path
        )
        print("[SUCCESS] Connected using wallet!")
        conn.close()
        sys.exit(0)
    except Exception as e:
        print(f"[FAILED] {str(e)[:200]}")
else:
    print("No wallet found. Wallet may be required for Oracle Cloud.")

print("\n" + "=" * 60)
print("All connection tests failed.")
print("=" * 60)
print("\nNext steps:")
print("1. Verify IP is whitelisted in Oracle Cloud Console")
print("2. Download Oracle Cloud wallet:")
print("   - Go to Oracle Cloud Console")
print("   - Navigate to your Autonomous Database")
print("   - Click 'DB Connection'")
print("   - Download the Wallet (zip file)")
print("   - Extract to a folder (e.g., C:\\oracle_wallet)")
print("   - Set: $env:TNS_ADMIN = 'C:\\oracle_wallet'")
print("3. Wait a few minutes for IP whitelist to propagate")
print("4. Verify credentials are correct")

