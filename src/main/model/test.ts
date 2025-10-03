function test() {
   
    try {
        console.log(a);
        return 1
    } catch (error) {
        console.log(error);
        return 2
    } finally {
       return 3
    }


}


function test2() {
    let a = Infinity
    a--
    console.log('a', a);


    console.log('a>0', a>0)
}


const res = test()
test2()
// console.log('res', res);