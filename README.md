
GIT HUB TEAM: 

Sandro: Video explicativo (Ponelo en X2 asi va mas rapido jaja)
https://www.youtube.com/watch?v=BtyAfOcN6nY&t=75s

 Comandos consola Git
https://david-choi.notion.site/Machete-de-GitHub-para-Equipos-309017214380807bba11f3ddf540f48a

METODO TRADICIONAL
 Basicamente se crea una rama dev A y una  dev B y la rama main, a medida que vamos a haciendo, cargamos en nuestras ramas y luego comprobamos la del otro a ver si hay conflictos. En el mismo git se puede ver si hay conflictos o algo. Si está todo okay se sube a la main (preferentemente usando el comando merge commit). En los commits que haga cada uno, se puede chequear en github y ver si hay conflictos
https://github.com/SandroArgent/Proyecto-Eccomerce-grupal.git (el github grupal que cree)

Para crear una rama propia:

git git checkout -b feature/dev-b (creamos nuestra propia rama)
git brach (para chequear nuestra rama actual)
git log   (para comprobar donde estamos parados)

git add . (guardar)
git commit -m "descripcion del cambio"
git push origin ( y sigue la rama a la que vas a subir, en este caso  feature/dev-b)