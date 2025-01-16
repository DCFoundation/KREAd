#!/bin/bash

# Ensure AGORIC_SDK_ROOT is set
source .env

if [ -z "$AGORIC_SDK_ROOT" ]; then
  echo "AGORIC_SDK_ROOT is not set in the .env file"
  exit 1
fi

# Create a symbolic link in the script directory pointing to AGORIC_SDK_ROOT
SCRIPT_DIR=$(dirname "$(realpath "$0")")

rm -rf "$SCRIPT_DIR/agoric-sdk"

mkdir "$SCRIPT_DIR/agoric-sdk"

ln -s "$AGORIC_SDK_ROOT/packages/" "$SCRIPT_DIR/agoric-sdk/packages"

echo "Symbolic link created: $SCRIPT_DIR/agoric-sdk -> $AGORIC_SDK_ROOT"
