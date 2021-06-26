#!/bin/bash
git stash
git checkout staging || git checkout main
git pull
git checkout -b dependabot$(date +%F)
npm update --dev
npm run lint
git commit -am "build: Update minor dependencies"
./node_modules/prettier/bin-prettier.js -w src/{**,.}/*.ts*
git commit -am "build: Prettier" --allow-empty
git push --set-upstream origin dependabot$(date +%F)
gh pr create --title "Dependabot batch" --body "All the minor dependabots, scripted PR" --reviewer cooper667,ChrisBaidoo,philipjackson,SilviaZeta
git checkout @{-2}
git stash pop
git branch -D dependabot$(date +%F)
