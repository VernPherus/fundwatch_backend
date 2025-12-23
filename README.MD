# FUNDWATCH 

*Always know where the money goes*

## PROJECT SETUP

Setup instructions after project cloning

* Initialize project:

```
npm install
```

### Prisma Setup:

* Generate prisma files
```
npx prisma init --datasource-provider postgresql --output ../generated/prisma
```

* Introspect the database

```
npx prisma db pull
```

* Create migration directory

```
mkdir -p prisma/migrations/0_init
```

* Generate migration file

```
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
```

* Mark migration as applied

```
npx prisma migrate resolve --applied 0_init
```

* Generate ORM Types:

```
npx prisma generate
```

### Prisma studio:

```
npx prisma studio --config ./prisma.config.ts
```