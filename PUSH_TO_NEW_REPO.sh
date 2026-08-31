#!/bin/bash
# Commands to push to new zim_table repo

# Remove old remote
git remote remove origin

# Add new remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/zim_table.git

# Push to new repo
git push -u origin main
