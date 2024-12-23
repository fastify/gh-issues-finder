import neostandard from 'neostandard'

export default neostandard({
  ignores: (await import('neostandard')).resolveIgnoresFromGitignore(),
  ts: true
})
