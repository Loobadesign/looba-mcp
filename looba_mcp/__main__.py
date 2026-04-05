"""Entry point for `python -m looba_mcp` and the `looba-mcp` console script."""

import os
import subprocess
import sys
from importlib.resources import files


def _ensure_node_modules():
    server_dir = str(files("looba_mcp").joinpath("server"))
    node_modules = os.path.join(server_dir, "node_modules")
    if not os.path.isdir(node_modules):
        subprocess.run(
            ["npm", "install", "--omit=dev"],
            cwd=server_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def main():
    server_js = str(files("looba_mcp").joinpath("server", "index.js"))
    _ensure_node_modules()
    try:
        result = subprocess.run(
            ["node", server_js],
            stdin=sys.stdin,
            stdout=sys.stdout,
            stderr=sys.stderr,
        )
        sys.exit(result.returncode)
    except FileNotFoundError:
        print(
            "Error: Node.js is required but not found. "
            "Install it from https://nodejs.org",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
