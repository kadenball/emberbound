"""Collect verified native outputs and a source-only project archive."""
import hashlib
import json
import shutil
import subprocess
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
artifacts = root / 'artifacts'
artifacts.mkdir(exist_ok=True)
apk = root / 'android/app/build/outputs/apk/debug/app-debug.apk'
aab = root / 'android/app/build/outputs/bundle/release/app-release.aab'

with zipfile.ZipFile(apk) as archive:
    for asset in (root / 'dist').rglob('*'):
        if asset.is_file():
            relative = asset.relative_to(root / 'dist').as_posix()
            assert archive.read(f'assets/public/{relative}') == asset.read_bytes(), f'Stale APK asset: {relative}'
with zipfile.ZipFile(aab) as archive:
    for asset in (root / 'dist').rglob('*'):
        if asset.is_file():
            relative = asset.relative_to(root / 'dist').as_posix()
            assert archive.read(f'base/assets/public/{relative}') == asset.read_bytes(), f'Stale AAB asset: {relative}'

shutil.copy2(apk, artifacts / 'emberbound-debug.apk')
shutil.copy2(aab, artifacts / 'emberbound-release-unsigned.aab')
files = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
source = artifacts / 'emberbound-source.zip'
with zipfile.ZipFile(source, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in sorted(set(files)):
        if name and (root / name).is_file() and not name.endswith(('.apk', '.aab', '.zip', 'SHA256SUMS.txt')):
            archive.write(root / name, f'emberbound/{name}')

outputs = [artifacts / 'emberbound-debug.apk', artifacts / 'emberbound-release-unsigned.aab', source]
checksums = '\n'.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}' for p in outputs) + '\n'
(artifacts / 'SHA256SUMS.txt').write_text(checksums)
for p in outputs:
    print(f'{p.name}: {p.stat().st_size / 1024 / 1024:.2f} MiB')
print('Both native packages contain the exact current production web build.')
