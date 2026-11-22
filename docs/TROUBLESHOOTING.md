# WeighIn Troubleshooting

This guide covers common configuration, fixture, GitHub Actions and permission
problems encountered when integrating WeighIn into a Soroban project.

For the complete fixture format, see [FIXTURES.md](FIXTURES.md).

For GitHub Actions token scopes and organization-level restrictions, see
[PERMISSIONS.md](PERMISSIONS.md).

## 1. GitHub Actions permission errors

WeighIn uses two workflows:

- `weighin.yml` runs the benchmark and uploads its artifacts.
- `weighin-comment.yml` downloads those artifacts and posts the PR comment.

The workflows have different permission requirements.

### Producer permission block

The benchmark workflow should remain read-only:

```yaml
permissions:
  contents: read
