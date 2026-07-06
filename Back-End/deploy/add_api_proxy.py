#!/usr/bin/env python3
"""Insert /api/ and /storage/ location blocks into the Nginx site config."""

import re
import sys
import os


def main():
    if len(sys.argv) < 2:
        print("Usage: add_api_proxy.py <nginx_config_path>")
        sys.exit(1)

    path = sys.argv[1]
    if not os.path.isfile(path):
        print(f"File not found: {path}")
        sys.exit(1)

    with open(path, "r") as f:
        content = f.read()

    if "location /api/" in content:
        print("OK: /api/ location already exists")
        return

    api_block = """    # Laravel API proxy (added by deploy)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Laravel storage (added by deploy)
    location /storage/ {
        alias /var/www/Location_Automobile/Back-End/storage/app/public/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

"""

    # Insert before the first "location / {" block
    new_content = re.sub(
        r"(\s+)(location / \{)",
        lambda m: m.group(1) + api_block + m.group(1) + m.group(2),
        content,
        count=1,
    )

    if new_content == content:
        print("WARN: Could not find 'location / {' in config")
        return

    with open(path, "w") as f:
        f.write(new_content)

    print(f"OK: Added /api/ and /storage/ to {path}")


if __name__ == "__main__":
    main()
