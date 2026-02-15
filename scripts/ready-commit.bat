@echo off
cd /d "%~dp0\.."
git add .
git commit -m "fix: Groq chat via .env, chat sem doc, pronto para push"
git push
echo Pronto. Repo isaquefl atualizado.
