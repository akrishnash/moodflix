# Oracle Cloud Connection Troubleshooting

## Current Issue

The connection to Oracle Cloud is being rejected. This is typically due to one of the following:

## Common Solutions

### 1. IP Whitelisting (Most Common)

Oracle Cloud Autonomous Database requires your IP address to be whitelisted.

**Steps:**
1. Log into Oracle Cloud Console
2. Navigate to your Autonomous Database
3. Go to **Network** → **Access Control Lists** or **Network Access**
4. Add your current IP address to the whitelist
5. Wait a few minutes for changes to propagate

**To find your IP:**
- Visit: https://whatismyipaddress.com/
- Or run: `curl ifconfig.me` (Linux/Mac) or check in PowerShell

### 2. Oracle Wallet (If Required)

Some Oracle Cloud configurations require a wallet file for SSL connections.

**Steps:**
1. In Oracle Cloud Console, go to your Autonomous Database
2. Click **DB Connection**
3. Download the **Wallet** (zip file)
4. Extract the wallet to a directory (e.g., `C:\oracle_wallet`)
5. Set environment variable:
   ```powershell
   $env:TNS_ADMIN = "C:\oracle_wallet"
   # or
   $env:ORACLE_WALLET = "C:\oracle_wallet"
   ```

### 3. Verify Credentials

Double-check:
- Username: `ADMIN` (case-sensitive)
- Password: `1@Oraclemomus`
- TNS Name: `movierecdb_tp`

### 4. Network Connectivity

Test connectivity:
```powershell
Test-NetConnection -ComputerName adb.ap-hyderabad-1.oraclecloud.com -Port 1522
```

If this fails, check:
- Firewall rules (allow outbound on port 1522)
- Corporate VPN/proxy settings
- Network restrictions

### 5. Try Different TNS Names

The script supports multiple TNS names. Try:
- `movierecdb_high` (higher performance)
- `movierecdb_medium` (balanced)
- `movierecdb_low` (lower cost)

```powershell
$env:ORACLE_TNS = "movierecdb_high"
```

## Quick Test

After fixing the issue, test the connection:

```powershell
$env:ORACLE_USER = "ADMIN"
$env:ORACLE_PASSWORD = "1@Oraclemomus"
$env:ORACLE_TNS = "movierecdb_tp"
python -c "import oracledb; conn = oracledb.connect('ADMIN/1@Oraclemomus@movierecdb_tp'); print('Connected!')"
```

## Good News

✅ **Embeddings are already created and saved!**

The script has saved embeddings to `embeddings.npy`. Once you fix the connection, the script will:
- Automatically load the saved embeddings (no need to regenerate)
- Skip directly to database insertion
- Complete much faster

## Next Steps

1. Fix the connection issue (likely IP whitelisting)
2. Run the script again - it will reuse the saved embeddings
3. The script will insert all 4803 movies into the database

