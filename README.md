Este proyecto se trata de una aplicacion web que permita crear personajes de un juego de rol bastante complejo llamado "GURPS". La aplicacion contiene
funcionalidad como guardado de personajes, calculo automatico de puntos, y un archivo local que permite almacenar
todas las habilidades creadas hasta la fecha por las reglas oficiales del juego para que puedan ser preseleccionadas en la aplicacion. El simulador cuenta con la funcionalidad
de poder guardar personajes a traves de la descarga de un archivo .json que almacena toda la informacion ingresada por el usuario, y tambien cuenta con la opcion de poder cargar
un personaje a traves de estos archivos.

Utiliza un sistema de puntos, cada atributo, habilidad, ventaja o desventaja que le sumemos al personaje va a sumar o restar puntos, por eso el costo 
final puede ser negativo. Esto se da porque el juego establece la base de los personajes basado en un humano adulto promedio, cada puntuacion de atributos 
siempre empieza en 10 porque es el "estandar" de un adulto promedio, es decir, todos tenemos una fuerza de 10, una inteligencia de 10, destreza de 10, etc. 

Ahora bien, para propositos del juego, todo aquello que esté por debajo de ese promedio es considerado una desventaja y por eso da una puntucacion negativa.
Cuando se inicia la campaña y los jugadores crean sus personajes, el GM (Game Master) debe definir que puntuacion tendrán los personajes. Para referencia,
un humano promedio tiene aproximadamente 50 puntos, Indiana Jones tendria unos 150 puntos (Humano excepcional/heroico), Darth Vader (Star Wars) tendría unos 500 puntos y 
Superman (DC) tendria unos 1000. De esta forma podemos representar cualquier tipo de personaje de cualquier universo literario/cinematográfico, siempre y cuando nos alcancen
los puntos que definimos al iniciar la campaña. Claramente si la campaña es con personajes de 100 puntos no podiramos hacer un Superman, pero si un humano adulto
experto en ingenieria aeroespacial por ejemplo (ya que está bastante por encima de la media en cuanto a puntos).

Ejemplo de creacion de personaje:

Supongamos que yo quiero crear a Superman en GURPS, Superman es capaz de levantar autos con mucha facilidad por lo que debería darle una puntuación de fuerza muy alta,
cada punto de fuerza cuesta 10 puntos, y para levantar un auto con facilidad el manual de reglas dice que debo tener por lo menos 30 de fuerza, 

Fuerza 30 cuesta 200 puntos.

Superman puede volar, en GURPS la habilidad de volar se puede representar con una ventaja llamada 'Vuelo' (Flight) que cuesta 40 puntos.

Vuelo cuesta 40 puntos.

Ahora bien, Superman es muy vulnerable a un mineral completamente exótico llamado "Kryptonita" eso se puede representar mediante una desventaja llamada "Vulnerabilidad",
que nos hace sufrir más daño cuando estamos en presencia de determinado objeto.

Vulnerabilidad ("Kryptonita") cuesta -20 puntos.

Hasta ahora nuestro total seria Fuerza 30 [200p] + Vuelo [40p] + Vulnerabilidad (Kryptonita) [-20p] dando un resultado final de 220p. Es por eso que las "puntuaciones negativas",
nos dan puntos a favor a costa de una desventaja en el juego, en una campaña de 1000p a mi Superman le podria seguir agregando cualquier ventaja, atributo, etc hasta gastar 780p
(1000 - 220 = 780), de lo contrario si mi Superman no fuese vulnerable a la Kryptonita me quedarian "menos puntos" para "gastar".

Para ejecutar el programa se debe abrir el archivo "index.html", ya sea directamente con el navegador o ejecutandolo con live server.
