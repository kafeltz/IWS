# .babelrc

É necessário adicionar os seguintes plugins para que o teste unitário do Jest funcione.
Senão fica dando erro no comando `npm run test:js` de `SyntaxError: Unexpected token ...`.

Isso ocorre porque o node é diferente do webpack.

Não entendi a razão, mas levei horas pra fazer funcionar isso.

# package.json
