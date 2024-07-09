### Bootstrap
#### Clone repo and bootstrap

```
yarn run bootstrap
```

### Yarn

#### Add dependencies to root

```
yarn add -W <dependencies>
```

#### Add dependencies to specific workspace
```
yarn workspace <workspace-name> add <packages>
```

#### Add dev dependencies
Just include the `--dev` or `-D` flag
```
yarn add -W --dev <dependencies>
```

#### Run a command with package scope
```
yarn workspace <workspace-name> build
```