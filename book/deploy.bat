mdbook build
git worktree add --orphan -B gh-pages gh-pages
xcopy book gh-pages /s /d /y
cd gh-pages
git add -A
git commit -m "Deploy changes"
git push origin +gh-pages
cd ..