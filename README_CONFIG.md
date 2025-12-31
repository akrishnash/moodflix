# Configuration Guide

## For Public Computers (No Permanent Environment Variables)

This script uses a `config.env` file for credentials, so you don't need to set permanent environment variables.

### Quick Setup:

1. **Create `config.env` file** (copy from `config.env.example` if available):
   ```
   ORACLE_USER=ADMIN
   ORACLE_PASSWORD=your_password
   ORACLE_TNS=movierecdb_tp
   TNS_ADMIN=E:\anurag\moodflix\db\Wallet_movierecdb
   ```

2. **Enable "Allow All Traffic" in Oracle Cloud** (see `ALLOW_ALL_TRAFFIC_SETUP.md`)
   - This allows connection from any IP address
   - No need to whitelist specific IPs

3. **Run the script:**
   ```powershell
   python process_kaggle.py
   ```

### File Structure:

```
moodflix/
├── config.env              # Your credentials (NOT in git)
├── process_kaggle.py       # Main script
├── test_oracle_connection.py  # Connection test
├── db/
│   ├── Wallet_movierecdb/  # Oracle wallet (NOT in git)
│   ├── tmdb_5000_movies.csv
│   └── tmdb_5000_credits.csv
└── embeddings.npy         # Cached embeddings (auto-generated)
```

### Security:

- ✅ `config.env` is in `.gitignore` (won't be committed)
- ✅ Wallet directory is in `.gitignore`
- ✅ Credentials are only stored locally
- ⚠️ Don't share `config.env` or wallet files

### Troubleshooting:

**Connection Refused:**
- Check if "Allow All Traffic" is enabled in Oracle Cloud
- Verify credentials in `config.env`
- Ensure wallet path is correct

**Wallet Not Found:**
- Check `TNS_ADMIN` path in `config.env`
- Ensure wallet files are extracted properly

**Still Having Issues?**
- Run `python test_oracle_connection.py` to diagnose
- Check `ALLOW_ALL_TRAFFIC_SETUP.md` for network setup

