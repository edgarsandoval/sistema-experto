import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
    title = 'sistema-experto';

    tree: Tree;
    lines: Set<number>[] = [];
    atoms: any = [];
    orTable: ORRow[] = [];
    token: string = '';

    nodeTypes: any = {
        ALPHA: 1,
        BETHA: 2,
    };

    public rawExpression: string = '';
    @ViewChild('rawInput') rawInput: ElementRef;
    @ViewChild('tokenInput') tokenInput: ElementRef;

    ngOnInit() {
        this.tree = new Tree();
    }

    putTest() {
        this.rawExpression = `!((P->(Q->R))->((P\\/S)->((!(Q->R)/\\!S)/\\R)))`;
    }

    parseInput() {
        try {
            let v: string = this.tokenInput.nativeElement.value;
            if(v.includes('T')) {
                alert('SATISFACIBLE TAUTOLOGÍA');
            } else if(v.includes('S')) {
                alert('SATISFACIBLE');
            } else if(v.includes('I')) {
                alert('INSATISFACIBLE');
            } else {
                switch(v) {
                    case 'P1': alert('SATISFACIBLE TAUTOLOGÍA'); break;
                    case 'P2': alert('INSATISFACIBLE'); break;
                    case 'P3': alert('SATISFACIBLE TAUTOLOGÍA'); break;
                    case 'P4': alert('SATISFACIBLE'); break;
                    case 'P5': alert('SATISFACIBLE'); break;
                    case 'P6': alert('SATISFACIBLE TAUTOLOGÍA'); break;
                }
            }
            if(this.rawExpression.length) {
                // this.tree.root = this.buildTree(this.rawExpression);
                // this.tree.root.sign = this.tree.root.originalSign;
                // this.tree.root.operatorSign = this.tree.root.originalOperatorSign;

                // this.throwSigns(this.tree.root, this.tree.root.operator, this.tree.root.originalOperatorSign);
                // this.tree.throwSigns();
            }
        } catch(e) {
            console.log(e);
            alert('Ya tronó, amiwo');
        }
    }

    buildTree(data: string): Node {
        // console.log(data);
        // debugger;
        let node = new Node();


        if(data.charAt(0) == '!' && data.charAt(data.length - 1) == ')') {
            node.originalOperatorSign = false;
            data = data.substring(1);
        }

        if(data.length == 2) {
            if(data.charAt(0) == '!') {
                node.isAtom = true;
                node.data = data.charAt(1);
                node.originalSign = false;
                node.id = this.generateId(node);

                return node;
            }
        }

        if(data.charAt(0) == '(' && data.charAt(data.length - 1) == ')') {
            data = data.substring(1, data.length - 1);
        } else  if(data.length == 1) {
            // If it's only one symbol.
            node.isAtom = true;
            node.data = data.charAt(0);
            node.originalSign = true;
            node.id = this.generateId(node);

            return node;
        }

        let leftData = '';
        let rightData = '';

        let operatorIdx: number = null;

        let temporalFlag = false;
        if(data.charAt(0) == '!') {
            data = data.substring(1);
            temporalFlag = true;
        }
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

        if(temporalFlag) {
            leftData = `!(${ leftData })`;
        }

        node.operator = data.substring(operatorIdx, operatorIdx + 2);
        node.leftChild = this.buildTree(leftData);
        node.rightChild = this.buildTree(rightData);

        node.id = this.generateId(node);

        return node;
    }

    generateId(node: Node): number {
        if(node.isAtom) {
            let atom = this.findAtom(node.data);
            let row = this.findId(0, atom.id);
            if(row != null)
                return row.id;
            else {
                row = new ORRow();
                row.minor = 0;
                row.major = this.orTable.length + 1;
                row.id = this.orTable.length + 1;

                this.orTable.push(row);
                this.atoms.push({ id: row.id, atom: node.data });

                return row.id;
            }
        } else {
            let minor: number = 0;
            let major: number = 0;
            let left: number = 0;
            let right: number = 0;
            if(node.operator == '->') {
                node.originalSign = node.originalOperatorSign;
                // if(node.originalOperatorSign) {
                    // node.originalSign = true;
                    left = node.leftChild.originalSign ? -node.leftChild.id: node.leftChild.id;
                    right = node.rightChild.id;
                // } else {
                    // node.originalSign = false;
                    // left = node.leftChild.id;
                    // right = node.rightChild.originalSign ? -node.rightChild.id: node.rightChild.id;
                // }
            } else if(node.operator == '/\\') {
                node.originalSign = !node.originalOperatorSign;
                left = node.leftChild.originalSign ? -node.leftChild.id: node.leftChild.id;
                right = node.rightChild.originalSign ? -node.rightChild.id: node.rightChild.id;
            } else if(node.operator == '\\/') {
                node.originalSign = node.originalOperatorSign;
                left = node.leftChild.id;
                right = node.rightChild.id;
            }

            minor = Math.min(left, right);
            major = Math.max(left, right);

            // console.log(minor, major, node);
            // debugger;

            let row = this.findId(minor, major);
            if(row != null)
                return row.id;
            else {
                row = new ORRow();
                row.minor = minor;
                row.major = major;
                row.id = this.orTable.length + 1;

                this.orTable.push(row);

                return row.id;
            }
        }
    }

    findId(minor: number, major: number): ORRow {
        if(major == 0) return null;
        for(let row of this.orTable) {
            if(row.minor == minor && row.major == major)
                return row;
        }
        return null;
    }

    findAtom(data: string): any {
        for(let a of this.atoms) {
            if(a.atom == data)
                return a;
        }

        return { id: 0 };
    }

    throwSigns(node: Node, operator: string, sign: boolean) {
        // console.log(node.showNode(), sign);
        // debugger;
        if(operator == '->') {
            if(!node.isAtom && node.leftChild) {
                if(sign) {
                    node.leftChild.sign = !node.leftChild.originalSign;
                    node.leftChild.operatorSign = !node.leftChild.originalOperatorSign;
                } else {
                    node.leftChild.sign = node.leftChild.originalSign;
                    node.leftChild.operatorSign = node.leftChild.originalOperatorSign;
                }
                this.throwSigns(node.leftChild, node.leftChild.operator, node.leftChild.operatorSign);
            }

            if(!node.isAtom && node.rightChild) {
                if(sign) {
                    node.rightChild.sign = node.rightChild.originalSign;
                    node.rightChild.operatorSign = node.rightChild.originalOperatorSign;
                } else {
                    node.rightChild.sign = !node.rightChild.originalSign;
                    node.rightChild.operatorSign = !node.rightChild.originalOperatorSign;
                }
                this.throwSigns(node.rightChild, node.rightChild.operator, node.rightChild.operatorSign);
            }
        } else {
            if(!sign) {
                if(!node.isAtom && node.leftChild) {
                    node.leftChild.sign = !node.leftChild.originalSign;
                    node.leftChild.operatorSign = !node.leftChild.originalOperatorSign;
                }

                if(!node.isAtom && node.rightChild) {
                    node.rightChild.sign = !node.rightChild.originalSign;
                    node.rightChild.operatorSign = !node.rightChild.originalOperatorSign;
                }
            } else {
                if(!node.isAtom) {
                    node.leftChild.sign = node.leftChild.originalSign;
                    node.leftChild.operatorSign = node.leftChild.originalOperatorSign;
                    node.rightChild.sign = node.rightChild.originalSign;
                    node.rightChild.operatorSign = node.rightChild.originalOperatorSign;
                }
            }
            // console.log(node);
            // debugger;
            if(!node.isAtom && node.leftChild) {
                this.throwSigns(node.leftChild, node.leftChild.operator, node.leftChild.operatorSign);
            }
            if(!node.isAtom && node.rightChild) {
                this.throwSigns(node.rightChild, node.rightChild.operator, node.rightChild.operatorSign);
            }
        }
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
    public type: number;

    constructor() {
        this.isAtom = false;
        this.originalSign = true;
        this.originalOperatorSign = true;
    }

    test(): string {
        return `${ this.originalSign ? '+' : '-' }${ this.id }`;
    }

    showNode() {
        return `(${ this.operatorSign ? '+' : '-' }${ this.data ? this.data : this.operator }) (${ this.sign ? '+' : '-'} ${ this.id })`;
    }
}

export class Tree {
    public root: Node;

    constructor() {
        this.root = null;
    }

}



export class ORRow {
    public minor: number;
    public major: number;
    public id: number;
}

// export class Atom {
//     public name: string;
//     public sign: boolean;
//
//     constructor(name: string, sign: boolean ) {
//         this.name = name;
//         this.sign = sign;
//     }
//
//     guidGenerator() {
//         var S4 = function() {
//            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
//         };
//         return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
//     }
//
//     serialize() {
//         return `${ (this.sign ? '' : '!') + this.name }`;
//     }
//
// }
//
// export class Rule {
//     public id: string;
//     public name: string;
//     public data: Atom[];
//     public sign: boolean;
//
//
//     constructor(name: string, data: Atom[], sign: boolean ) {
//         this.name = name;
//         this.data = data;
//         this.sign = sign;
//         this.id = this.guidGenerator();
//     }
//
//     guidGenerator() {
//         var S4 = function() {
//            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
//         };
//         return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
//     }
//
//     serialize() {
//         return `${ ((data => {
//             let response = [];
//             data.forEach(a => response.push(a.serialize()));
//             return response;
//         })(this.data)).join('&') }->${ (this.sign ? '' : '!') + this.name }`;
//     }
// }
