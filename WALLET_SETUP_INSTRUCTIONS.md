# Oracle Cloud Wallet Setup Instructions

## Why You Need a Wallet

Oracle Cloud Autonomous Database typically requires a wallet file for SSL/TLS connections. The wallet contains:
- SSL certificates
- Connection configuration
- Security credentials

## How to Download the Wallet

### Step 1: Access Oracle Cloud Console

1. Log into [Oracle Cloud Console](https://cloud.oracle.com)
2. Navigate to your Autonomous Database instance

### Step 2: Download Wallet

1. In your Autonomous Database details page, click **"DB Connection"** button
2. In the popup, you'll see connection strings and wallet options
3. Click **"Download Wallet"**
4. Enter a password for the wallet (remember this - you may need it)
5. Click **"Download"** - this downloads a ZIP file

### Step 3: Extract Wallet

1. Extract the ZIP file to a folder, for example:
   - Windows: `C:\oracle_wallet`
   - Linux/Mac: `~/oracle_wallet`

2. The extracted folder should contain:
   - `tnsnames.ora` - Connection strings
   - `sqlnet.ora` - Network configuration
   - `cwallet.sso` - Single sign-on wallet
   - `ewallet.p12` - PKCS12 wallet
   - `keystore.jks` - Java keystore
   - `ojdbc.properties` - JDBC properties

### Step 4: Set Environment Variable

**Windows PowerShell:**
```powershell
$env:TNS_ADMIN = "C:\oracle_wallet"
```

**Windows CMD:**
```cmd
set TNS_ADMIN=C:\oracle_wallet
```

**Linux/Mac:**
```bash
export TNS_ADMIN=~/oracle_wallet
```

### Step 5: Test Connection

Run the test script:
```powershell
$env:ORACLE_USER="ADMIN"
$env:ORACLE_PASSWORD="1@Oraclemomus"
$env:ORACLE_TNS="movierecdb_tp"
python test_oracle_connection.py
```

## Alternative: Use Wallet Password

If the wallet requires a password, you may need to set it:
```powershell
$env:ORACLE_WALLET_PASSWORD="your_wallet_password"
```

## Troubleshooting

### Wallet Not Found
- Verify the path is correct
- Check that all wallet files are in the directory
- Ensure TNS_ADMIN environment variable is set

### Still Can't Connect
1. **Verify IP Whitelisting:**
   - Oracle Cloud Console → Your DB → Network → Access Control Lists
   - Ensure your IP is added

2. **Check Wallet Password:**
   - If you set a password when downloading, you may need to use it

3. **Try Different TNS Names:**
   - `movierecdb_high`
   - `movierecdb_medium`
   - `movierecdb_low`

4. **Wait for Propagation:**
   - IP whitelist changes can take 2-5 minutes to propagate

## Quick Reference

```powershell
# Set credentials
$env:ORACLE_USER="ADMIN"
$env:ORACLE_PASSWORD="1@Oraclemomus"

# Set wallet location (after downloading)
$env:TNS_ADMIN="C:\oracle_wallet"

# Run the script
python process_kaggle.py
```

