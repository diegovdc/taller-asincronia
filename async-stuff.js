// este archivo se corre con el comando `node`
// en la terminal, estando en la carpeta con este archivo correr: node async-stuff.js
// en los bloques marcados con "!!!! FUNCIONES" descomentar las diversas llamadas a funciones para ver lo que hacen

const runTimeoutExampleWithCallbacks = () => {
  let num = 5
  setTimeout(() => {
    console.log('timeout')
    num = num + 1
    setTimeout(() => {
      console.log('timeout')
      num = num + 1
      setTimeout(() => {
        console.log('timeout')
        num = num + 1
        setTimeout(() => {
          console.log('timeout')
          num = num + 1
          setTimeout(() => {
            console.log('timeout')
            num = num + 1
  
          }, 1000)
        }, 1000)
      }, 1000)
    }, 1000)  
  }, 1000)
}


const runTimeoutExampleWithPromises = () => {
  const promiseTimeout = (num) => new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('timeout')
      resolve(num + 1)
    }, 1000)
  })
  return promiseTimeout(5)
  .then(num => promiseTimeout(num))
  .then(num => promiseTimeout(num))
  .then(num => promiseTimeout(num))
  .then(num => promiseTimeout(num))
  .then(console.log)
}


// !!!! FUNCIONES
// runTimeoutExampleWithCallbacks()
// runTimeoutExampleWithPromises()


const getUserById = id => new Promise((resolve, reject) => { // simulamos con esto una petición a una base de datos
  resolve({
    userId: id,
    name: 'User '+ id,
    friendsIds: [1,2,3,4]
  })
})


const getUserName = user => user.name

const logUserFriendsNamesWithStandardPromises = (userId) => {
  return getUserById(userId)// llama a la DB
  .then(user => user.friendsIds) // saca a los amigos
  .then(friendsIds => 
    friendsIds.map(id => getUserById(id)) // genera un array de promesas para traer a losamigos de los usuarios
  )
  .then(promiseArrayWithFriends => Promise.all(promiseArrayWithFriends)) // convierte el array de promsesas en una promesa con un array de valores normales
  .then(friends => friends.map(getUserName)) // saca los nombres de los amigos
  // .then(friends => {// lo mismo que la función de arriba, pero con un for loop
  //   let result = [];
  //   for(let i = 0; i < friends.length; i++) {
  //     result.push(getUserName(friends[i]))
  //   }
  //   return result
  // })
}



const logUserFriendsNamesWithPromisesUsingAsyncAwaitSyntax = async (userId) => { // hay que crear a función con la palabra clave async
  // dentro de una función async podemos usar la palabra clave await
  // await se llama en cada promesa para "extraer" el valor de dentro de la promesa
  const user = await getUserById(userId)
  const friendsIds = user.friendsIds
  const promiseArrayWithFriends = friendsIds.map(id => getUserById(id))
  const friends = await Promise.all(promiseArrayWithFriends)
  return friends.map(getUserName)
}

// !!!! FUNCIONES
// ambas funciones hacen exactamente lo mismo, tienen sólo distintas sintaxis a su interior, pero ambas devuelven Promesas (eso no es tan claro con las async functions, pero siempre es así)
// logUserFriendsNamesWithStandardPromises(5).then(console.log) //loggea todo
// logUserFriendsNamesWithPromisesUsingAsyncAwaitSyntax(5).then(console.log) //es una Promise, por eso podemos usar .then



//===== Asincronía con node =======

// Usando callbacks
const fs = require('fs')
const copyAndMergeTwoFiles = (mergedFilePath, path1, path2, callback) => { // puede que necesitemos un callback para hacer más cosas o lidiar con el error
  fs.readFile(path1, 'utf8', (err, data) => {
    if(err) {callback(err); return}
    fs.readFile(path2, 'utf8', (err2, data2) => {
      if(err2) {callback(err2); return}
      const mergedData =  `File 1: \n${data} \n\n File2: \n ${data2}`
      console.log('****Archivos mergeados:****\n\n', mergedData)
      fs.writeFile(mergedFilePath, data+data2,  (err3) => {
        if(err3) {callback(err3); return}
        callback(null)
      })
    })
  })
}


// Usando Promises:

// metemos las funciones asíncronas de Node en Promesas (es prácticamente el mismo patrón siempre)
// de hecho hay una función que se llama "promisify" que lo puede hacer automáticamente
const readFilePromise = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => { 
      err ? reject(err) : resolve(data)
    })
})

const writeFilePromise = (path, data) => new Promise((resolve, reject) => {
  fs.writeFile(path, data, (err, nothing) => {  // write file no devuelve nada en su segundo argumento
      err ? reject(err) : resolve(nothing)
    })
})


// con promesas puras
const copyAndMergeTwoFiles2 = (mergedFilePath, path1, path2) => {
  // cada .then aquí regresa una promesa distinta, es fácil agregar nuevas operaciones
  return readFilePromise(path1)
  .then(data => 
    readFilePromise(path2).then(data2 => `File 1: \n${data} \n\n File2: \n ${data2}`) // nótese que `data` está disponible aquí, por la clausura (closure, recomiendo mucho leer sobre esto)
  )
  // .then(mergedData => {console.log('****Archivos mergeados:****\n\n', mergedData); return mergedData}) // logeamos y regresamos el mismo dato
  .then(mergedData => writeFilePromise(mergedFilePath, mergedData))
}


// con la sintaxis de async/await
const copyAndMergeTwoFiles3 = async (mergedFilePath, path1, path2) => {
  const data = await readFilePromise(path1)
  const data2 = await readFilePromise(path2)
  const mergedData =  `File 1: \n${data} \n\n File2: \n ${data2}`
  // console.log('****Archivos mergeados:****\n\n', mergedData)
  return writeFilePromise(mergedFilePath, mergedData)
}


// si copyAndMergeTwoFiles2 o copyAndMergeTwoFiles3 se usa en una función async se puede usar try/catch
const someAsyncFunc = async (mergedFilePath, path1, path2) => {
  try {
    await copyAndMergeTwoFiles2(mergedFilePath, path1, path2)
    console.log('Operation 4 Successful!')
  } catch (error) {
    console.error("There was an error: ", error);
  }
}


// uso
// !!!! FUNCIONES
// Descomentar las siguientes llamadas de funciones, 
// cambiar los nombres de los archivos o los paths por archivos y paths inexistentes, 
// ver qué pasa con los errores
const myCallback = (err) => {
  err 
  ? console.error('There was an error', err) 
  : console.log('Operation 1 Successful!')
}
// copyAndMergeTwoFiles('./merged-files', './.gitignore', './.babelrc', myCallback)

/*
copyAndMergeTwoFiles2('./.merged-files2', './.gitignore', './.babelrc')
.then(console.log('Operation 2 Successful!'))
.catch(err => console.error('There was an error:', err))// comentar esta línea y descomentar la que sigue para ver maneras de procesar el error
// .catch(Object.keys).then(console.log)// cacha el error, lo procesa de algún modo y continua con la cadena de .thens
*/

/*
copyAndMergeTwoFiles3('./.merged-files3', './.gitignore', './.babelrc')
.then(console.log('Operation 3 Successful!'))
.catch(err => console.error('There was an error:', err))// comentar esta línea y descomentar la que sigue para ver maneras de procesar el error
// .catch(err => console.error('There was an error:', err))// comentar esta línea y descomentar la que sigue para ver maneras de procesar el error
*/

// someAsyncFunc('./.merged-files2', './.gitignor', './.babelrc')