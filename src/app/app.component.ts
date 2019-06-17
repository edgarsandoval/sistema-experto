import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare var lscache: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
    title = 'sistema-experto';
    public rules: Rule[] = [];
    public atoms: Set<string> = new Set([]);
    public rawExpression: string = '';
    @ViewChild('rawInput') rawInput: ElementRef;

    ngOnInit() {
        let atoms = lscache.get('atoms');
        if(atoms != null) {
            atoms.forEach(a => {
                this.atoms.add(a);
            });
        }

        let rules = lscache.get('rules');
        if(rules != null) {
            rules.forEach(r => {
                this.rules.push(this.mapRule(r));
            });
        }

    }

    parseInput() {
        try {
            let data        = this.rawExpression.split('->');
            let ruleName: string    = data[1];
            let atomsData: any      = data[0];
            let ruleSign: boolean = true;
            let atomsArray: Atom[] = [];

            if(ruleName.includes('!')) {
                ruleSign = false;
                ruleName = ruleName.substring(1);
            }
            atomsData = atomsData.split('&');
            atomsData.forEach((a: string) => {
                let atomSign: boolean = true
                if(a.includes('!')) {
                    atomSign = false;
                    a = a.substring(1);
                }
                atomsArray.push(new Atom(a, atomSign));
                this.atoms.add(a);
            });

            this.atoms.add(ruleName);
            this.rules.push(new Rule(ruleName, atomsArray, ruleSign));
            // console.log(this.rules);


            lscache.set('atoms', this.mapValues(this.atoms));
            lscache.set('rules', this.rules);
            this.rawExpression = '';
            alert('Regla ingresada con éxito');
        } catch(e) {
            alert('Existe un error en la expresión ingresada');
        }
    }

    mapValues(atoms: Set<string>) {
        let response = [];
        atoms.forEach(a => response.push(a));
        return response;
    }

    mapRule(r: any) {
        let atomsData: Atom[] = [];
        r.data.forEach((a: Atom) => {
            atomsData.push(new Atom(a.name, a.sign));
        });

        return new Rule(r.name, atomsData, r.sign);
    }

    showRule(r: Rule) {
        alert(r.serialize());
    }

    append(atomText: string) {
        this.rawExpression += atomText;
        setTimeout(()=>{ // this will make the execution after the above boolean has changed
            this.rawInput.nativeElement.focus();
        },0);
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
