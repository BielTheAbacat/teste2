COMO LIGAR O SITE AO SUPABASE (faca uma vez)
1) Crie uma conta gratis em supabase.com e clique em "New project".
2) Crie o login do dono: menu Authentication > Users > Add user > Create new user.
   E-mail: dono@sabeime.com | Senha: uma de 6 ou mais caracteres | marque "Auto Confirm User".
3) Menu SQL Editor > New query. Abra o arquivo supabase/setup.sql, copie TUDO, cole e clique em Run.
4) Em Authentication, nas configuracoes de login, DESLIGUE "Allow new users to sign up".
5) Pegue os dois dados do projeto (botao "Connect" ou Settings > API Keys):
   - Project URL
   - Publishable key (comeca com sb_publishable_). NUNCA use a chave "secret".
6) Na Vercel: Settings > Environment Variables. Crie:
   NEXT_PUBLIC_SUPABASE_URL = (o Project URL)
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = (a Publishable key)
7) Envie estes arquivos ao projeto e faca "Redeploy". O Blob da Vercel nao e mais usado.
Para entrar no painel: clique no chapeu de cozinheiro e digite a senha do passo 2.
O numero do WhatsApp fica no comeco de app/page.js.
