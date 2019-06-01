// 困难版
function Foo() {
    getName = function () { console.log(1); };
    return this;
}
Foo.getName = function () { console.log(2); };
Foo.prototype.getName = function () { console.log(3); };
var getName = function () { console.log(4); };
function getName() { console.log(5); }

//请写出以下输出结果：
Foo.getName();
getName();
Foo().getName();
getName();
new Foo.getName();
new Foo().getName();
new new Foo().getName();

// 极限版
function Foo() {
    this.getName = function () {
        console.log(3);
        return {
            getName: getName
        }
    };
    getName = function () {
        console.log(1);
    };
    return this
}
Foo.getName = function () {
    console.log(2);
};
Foo.prototype.getName = function () {
    console.log(6);
};
var getName = function () {
    console.log(4);
};

function getName() {
    console.log(5);
} 

Foo.getName();
getName();
Foo().getName();
getName();
new Foo.getName();
new Foo().getName();
new Foo().getName().getName();
new new Foo().getName();
