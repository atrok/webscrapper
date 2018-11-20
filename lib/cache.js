
var Cache=function Cache(){
    var cache = {},
    isCached=function(url){
        // cut off any internal references/anchors
        let s=getexternalurl(url);
    
        return (!cache[s])? false : true;
    },
    add=function(index,obj){
        let t=getexternalurl(index);
        cache[t]=obj;
    },
    get=function(index){
        let t=getexternalurl(index);
        return cache[t];
    },
    getexternalurl=function(url){
        let s=url.split('#');
        return s[0];
    };

    return {
        isCached: isCached,
        add: add,
        get: get,
    }
}

var create=function(){
    return Cache();
}

module.exports={create: create};