import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// declare var lscache: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
    title = 'sistema-experto';

    tree: Tree;
    public rawExpression: string = '';
    @ViewChild('rawInput') rawInput: ElementRef;

    ngOnInit() {
        this.tree = new Tree();
    }

    putTest() {
        this.rawExpression = `!((P->(Q->R))->((P\\/S)->((!(Q->R)/\\!S)/\\R)))`;
    }

    parseInput() {
        try {
            // let originalExpresion = this.rawExpression;
            this.tree.root = this.buildTree(this.rawExpression);
            console.log(this.tree);
            // this.rawExpression = originalExpresion;
        } catch(e) {
            console.log(e);
            alert('Existe un error en la expresión ingresada');
        }
    }

    buildTree(data: string): Node {
        console.log(data);
        debugger;
        let node = new Node();

        if(data.charAt(0) == '!') {
            node.originalSign = false;
            data = data.substring(1);

            if(data.charAt(0) == '(' && data.charAt(data.length - 1) == ')') {
                data = data.substring(1, data.length - 1);
            } else  if(data.length == 1) {
                // If it's only one symbol.
                node.isAtom = true;
                node.data = data.charAt(0);

                return node;
            }
        } else {
            node.originalSign = true;
            if(data.charAt(0) == '(') {
                data = data.substring(1, data.length - 1);
            }
            else if(data.length == 1) {
                // If it's only one symbol.
                node.isAtom = true;
                node.data = data.charAt(0);

                return node;
            }
        }

        let leftData = '';
        let rightData = '';

        let operatorIdx: number = null;

        if(data.charAt(0) == '(') {
            let openParentheses = 1;
            for(let i = 1; i < data.length; i++) {
                if(data.charAt(i) == '(')
                openParentheses++;
                else if(data.charAt(i) == ')')
                openParentheses--;

                if(openParentheses == 0) {
                    leftData = data.substring(1, i);
                    operatorIdx = i + 1;
                    break;
                }
            }
        } else {
            leftData = data.charAt(0);
            operatorIdx = 1;
        }
        rightData = data.substring(operatorIdx + 2);
        // console.log(data, leftData, rightData);
        // debugger;

        node.operator = data.substring(operatorIdx, operatorIdx + 2);
        node.leftChild = this.buildTree(leftData);
        node.rightChild = this.buildTree(rightData);
        return node;
    }
}

export class Node {
    public leftChild: Node;
    public rightChild: Node;

    public isAtom: boolean;
    public originalOperatorSign: boolean;
    public operatorSign: boolean;
    public operator: string;

    public id: number;
    public originalSign: boolean;
    public sign: boolean;
    public data: string;

    constructor() {
        this.isAtom = false;
    }
}

export class Tree {
    public root: Node;

    constructor() {
        this.root = null;
    }
}

export class Atom {
    public name: string;
    public sign: boolean;

    constructor(name: string, sign: boolean ) {
        this.name = name;
        this.sign = sign;
    }

    guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    serialize() {
        return `${ (this.sign ? '' : '!') + this.name }`;
    }

}

export class Rule {
    public id: string;
    public name: string;
    public data: Atom[];
    public sign: boolean;


    constructor(name: string, data: Atom[], sign: boolean ) {
        this.name = name;
        this.data = data;
        this.sign = sign;
        this.id = this.guidGenerator();
    }

    guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    serialize() {
        return `${ ((data => {
            let response = [];
            data.forEach(a => response.push(a.serialize()));
            return response;
        })(this.data)).join('&') }->${ (this.sign ? '' : '!') + this.name }`;
    }
}
