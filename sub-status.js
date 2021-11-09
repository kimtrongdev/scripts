var Sub = module.exports = {
    sub: false,
    getStatus: function(){
        return Sub.sub
    },
    setSub: function(status){
        Sub.sub = status
    }
}