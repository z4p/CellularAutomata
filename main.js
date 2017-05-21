"use strict";

function CellularAutomaton(domId) {
    this.DOMParent = document.getElementById(domId);
    this.init();
}

CellularAutomaton.prototype = {
    width: 32,
    height: 32,
	maxStateValue: 4,
    history: [],
    loop: 0,
    ticks: 0,
    timeT: 150,
    timer: null,
    DOMParent: null,
    DOMTable: null,
    rules: [],
    currentRule: null,
    saveEnabled: false,
    saves: [],
    
    btnStep: null,
    btnReset: null,
    btnGo: null,
    btnSave: null,
    btnRestore: null,
    listSaves: null,
    txtInfo: null,
    
    restore: function() {
        if(!this.saveEnabled) {
            alert("Ваш браузер не поддерживает работу с локальным хранилищем.\n"
            +"Сохранение и загрузка состояний недоступны!");
            return;
        }
        
        var strSave = localStorage.getItem("savedStates");
        if (!strSave) {
            strSave = "[]";
        }
        
        this.saves = JSON.parse(strSave);
        
        if (!this.saves) {
            return;
        }
        
        $(this.listSaves).empty();
        for(var i = 0; i < this.saves.length; i++) {
            $("<option value=" + i + ">" + this.saves[i].name + "</option>").appendTo(this.listSaves);
        }
    },
    
    loadState: function() {
        if(this.listSaves.value === "") {
            alert("Не выбрано состояние для загрузки");
            return;
        }
        
        var strSave = this.saves[this.listSaves.value].state;
        
        var c = 0;
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.width; j++) {
                this.a[i][j] = parseInt(strSave[c]);
                c++;
            }
        }
        this.redraw();
    },
    
	eraseState: function() {
		if(this.listSaves.value === "") {
            alert("Не выбрано состояние для удаления");
            return;
        }
        var i = this.listSaves.value;
        
		this.saves.splice(i, 1);
        this.save();
		
		$(this.listSaves).empty();
        for(var i = 0; i < this.saves.length; i++) {
            $("<option value=" + i + ">" + this.saves[i].name + "</option>").appendTo(this.listSaves);
        }
	},
	
    saveState: function() {
        var stateName = prompt("Название состояния","state");
        
        var curState = '';
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.width; j++) {
                curState += this.a[i][j];
            }
        }
        
        var newSave = {
            'name': stateName,
            'width': this.width,
            'height': this.height,
            'state': curState,
        }
        
        this.saves.push( newSave );
        
        $(this.listSaves).empty();
        for(var i = 0; i < this.saves.length; i++) {
            $("<option value=" + i + ">" + this.saves[i].name + "</option>").appendTo(this.listSaves);
        }
        
        if(this.saveEnabled) {
            // сохраняем в localStorage
            this.save();
        }
    },
    
    save: function() {
        if(!this.saveEnabled) {return;}
        localStorage.setItem("savedStates", JSON.stringify(this.saves));
    },
    
    randomSoup: function () {
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.height; j++) {
                this.a[i][j] = Math.floor(Math.random() * this.maxStateValue);
            }
        }
        this.redraw();
    },
    
    init: function() {
        var that = this;
        
        // инициализация матрицы
        this.a = new Array(64);
        for(var i = 0; i < this.height; i++) {
            this.a[i] = new Array(64);
            for(var j = 0; j < this.height; j++) {
                this.a[i][j] = 0;
            }
        }
        
        // таблица-матрица для отрисовки состояния
        var tbl = document.createElement('table');
        tbl.id = 'cellArea';
        $('.area').append(tbl);
        this.DOMTable = tbl;
        
        // input ввода числа шагов
        var inpStep = $('<input id="stepCount" value=1 size=7>');
        this.inpStep = inpStep;
        
        // форма управления
        var btnStep = document.createElement('BUTTON');
        btnStep.appendChild( document.createTextNode('шаги') );
        btnStep.onclick = function() {
            that.steps = parseInt($("#stepCount").val());
            that.goSteps();
            btnGo.innerHTML = 'Стоп';
        };
        this.btnStep = btnStep;
        
        var btnReset = document.createElement('BUTTON');
        btnReset.appendChild( document.createTextNode('Сброс') );
        btnReset.onclick = function() {
            that.clearArea();
        };
        this.btnReset = btnReset;
        
        var btnGo = document.createElement('BUTTON');
        btnGo.appendChild( document.createTextNode('Старт') );
        btnGo.onclick = function() {
            if(that.timer) {
                that.stopSteps();
                btnGo.innerHTML = 'Старт';
            } else {
                that.steps = 100500;
                that.goSteps();
                btnGo.innerHTML = 'Стоп';
            }
        };
        this.btnGo = btnGo;
        
        var btnSave = document.createElement('BUTTON');
        btnSave.appendChild( document.createTextNode('Сохранить') );
        btnSave.onclick = function() {
            that.saveState();
        };
        this.btnSave = btnSave;
        
        var btnRestore = document.createElement('BUTTON');
        btnRestore.appendChild( document.createTextNode('Загрузить') );
        btnRestore.onclick = function() {
            that.loadState();
        };
        this.btnRestore = btnRestore;
        
        var btnErase = document.createElement('BUTTON');
        btnErase.appendChild( document.createTextNode('Удалить') );
        btnErase.onclick = function() {
            that.eraseState();
        };
        this.btnErase = btnErase;
        
        var btnRand = document.createElement('BUTTON');
        btnRand.appendChild( document.createTextNode('Бульон') );
        btnRand.onclick = function() {
            that.randomSoup();
        };
        this.btnRand = btnRand;
        
        var btnNoise = document.createElement('BUTTON');
        btnNoise.appendChild( document.createTextNode('Шум') );
        btnNoise.onclick = function() {
            that.noise();
            that.redraw();
        };
        this.btnNoise = btnNoise;
        
        var listSaves = document.createElement('SELECT');
        listSaves.setAttribute('size', 8);
		listSaves.ondblclick = function() {
			that.loadState();
		}
        this.listSaves = listSaves;
        
        
        
        // выбор правил
        
        this.rules = [this.ruleSum, this.ruleBurn, this.ruleLife, this.ruleCycle, this.ruleSuCA];
        this.currentRule = this.rules[0];
        
        var listRules = document.createElement('SELECT');
		$("<option value='0'>Сумма (mod 2)</option>").appendTo( listRules );
		$("<option value='1'>Голосование</option>").appendTo( listRules );
		$("<option value='2'>Игра 'Жизнь'</option>").appendTo( listRules );
		$("<option value='3'>Циклический</option>").appendTo( listRules );
        $("<option value='4'>КА окрестность фон неймана</option>").appendTo( listRules );
		listRules.onchange = function() {
			that.currentRule = that.rules[$(this).val()];
		}
        this.listRules = listRules;
        
        
        // выбор периода
        var timerSelect = document.createElement('SELECT');
        $("<option value='100'>100 мс</option>").appendTo( timerSelect );
		$("<option value='200'>200 мс</option>").appendTo( timerSelect );
		$("<option value='500'>500 мс</option>").appendTo( timerSelect );
		$("<option value='1000'>1000 мс</option>").appendTo( timerSelect );
		timerSelect.onchange = function() {
			that.timeT = $(this).val();
		}
        this.timerSelect = timerSelect;
        
        // выбор размеров поля
        var sizeSelect = document.createElement('SELECT');
        $("<option value='8'>8x8</option>").appendTo( sizeSelect );
		$("<option value='16'>16x16</option>").appendTo( sizeSelect );
		$("<option value='32' selected>32x32</option>").appendTo( sizeSelect );
		$("<option value='other'>другой размер</option>").appendTo( sizeSelect );
		//$("<option value='64'>64x64</option>").appendTo( sizeSelect );
		sizeSelect.onchange = function() {
            if ($(this).val() === 'other') {
                that.width = prompt("Ширина поля","32");
                that.height = prompt("Высота поля","32");
                that.a = new Array(that.width);
                for(var i = 0; i < that.height; i++) {
                    that.a[i] = new Array(64);
                    for(var j = 0; j < that.height; j++) {
                        that.a[i][j] = 0;
                    }
                }
            } else {
                that.width = $(this).val();
                that.height = that.width;
            }
            that.redraw();
		}
        this.sizeSelect = sizeSelect;
        
        
        var info = document.createElement('P');
        info.setAttribute('id', 'caInfo');
        this.txtInfo = info;
        
        // проверка работы хранилища
        if(typeof(Storage) !== "undefined") {
            this.saveEnabled = true;
        } else {
            alert("Ваш браузер не поддерживает работу с локальным хранилищем.\n"
            +"Функции сохранения и загрузки состояний недоступны!");
            
            btnSave.setAttribute('disabled','disabled');
            btnRestore.setAttribute('disabled','disabled');
            listSaves.setAttribute('disabled','disabled');
        }
        
        var ctrl = document.getElementById('control');
        var br = function(){return document.createElement('BR');}
        var hr = function(){return document.createElement('HR');}
        
        ctrl.appendChild(sizeSelect);
        ctrl.appendChild(br());
        ctrl.appendChild(timerSelect);
        ctrl.appendChild(br());
        inpStep.appendTo(ctrl);
        ctrl.appendChild(btnStep);
        ctrl.appendChild(br());
        ctrl.appendChild(btnGo);
        ctrl.appendChild(btnReset);
        ctrl.appendChild(hr());
        ctrl.appendChild(btnRand);
        ctrl.appendChild(btnNoise);
        ctrl.appendChild(hr());
        ctrl.appendChild(listRules);
        ctrl.appendChild(hr());
        ctrl.appendChild(listSaves);
        ctrl.appendChild(br());
        ctrl.appendChild(btnSave);
        ctrl.appendChild(br());
        ctrl.appendChild(btnErase);
        ctrl.appendChild(btnRestore);
        ctrl.appendChild(hr());
        ctrl.appendChild(info);
        
        // восстановление сохраненных состояний из localStorage
        this.restore();
        
        this.redraw();
    },
    /*
    check: function(i,j) {
        var c = 0;
        if (i > 0) c += this.a[i-1][j];
        if (j > 0) c += this.a[i][j-1];
        if (i < this.height-1) c += this.a[i+1][j];
        if (j < this.width-1)  c += this.a[i][j+1];
        return c;
    },
    */
    ruleSum: function(i,j) {
        var c = 0;
        for(var a = i-1; a <= i+1; a++)
            for(var b = j-1; b <= j+1; b++)
                if (a >= 0 && b >= 0 && a < this.width && b < this.height) {
                    c += this.a[a][b];
                }
        return c % this.maxStateValue;
    },
    
    ruleBurn: function(i,j) {
        var c = 0;
        for(var a = i-1; a <= i+1; a++)
            for(var b = j-1; b <= j+1; b++)
                if (a >= 0 && b >= 0 && a < this.width && b < this.height) {
                    c += this.a[a][b];
                }
        return Math.round(c/9);
    },
    
    ruleLife: function(i,j) {
        var c = 0;
        for(var a = i-1; a <= i+1; a++)
            for(var b = j-1; b <= j+1; b++)
                if (a >= 0 && b >= 0 && a < this.width && b < this.height && !(a == i && b == j)) {
                    c += this.a[a][b];
                }
        if (this.a[i][j] === 0 && c == 3) return 1;
        if (this.a[i][j] === 1 && c <= 3 && c >= 2) return 1;
        return 0;
    },
    
    ruleCycle: function(i,j) {
        var c1 = 0;
        var c2 = 0;
        for(var a = i-1; a <= i+1; a++)
            for(var b = j-1; b <= j+1; b++)
                if (a >= 0 && b >= 0 && a < this.width && b < this.height && !(a == i && b == j)) {
                    if(this.a[a][b] === 1) c1++;
                    else c2++;
                }
        if (this.a[i][j] === 0 && c1 > 0) return 1;
        if (this.a[i][j] === 1 && c2 > 0) return 0;
        return this.a[i][j];
    },
    
    ruleSuCA: function(i,j) {
        var c = this.a[i][j];
        
        if (i > 0)              c ^= this.a[i-1][j];
        if (j > 0)              c ^= this.a[i][j-1];
        if (i < this.height-1)  c ^= this.a[i+1][j];
        if (j < this.width-1)   c ^= this.a[i][j+1];
                
        return c;
    },
    
    noise: function() {
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.height; j++) {
                if (Math.random() > 0.9) {
                    this.a[i][j] = (this.a[i][j] + 1) % this.maxStateValue;
                }
            }
        }
    },
    
    clearArea: function() {
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.height; j++) {
                this.a[i][j] = 0;
            }
        }
        this.ticks = 0;
        this.loop = 0;
        this.redraw();
    },
    
    step: function() {
        // BLOCK loop search
        var curState = '';
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.width; j++) {
                curState += this.a[i][j];
            }
        }
        
        if (this.loop === 0) {
            for(var i = this.history.length-1; i >= 0; i--) {
                if (this.history[i] === curState) {
                    this.loop = this.history.length - i;
                }
            }
            if (this.loop === 0) {
                this.history.push(curState);
            }
            this.ticks++;
        }
        
        // ENDBLOCK
       
        var l = [];
//var lg = [];
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.width; j++) {
                var t = this.currentRule(i,j);
//lg.push( t );
                if (this.a[i][j] != t) {
                    l.push({cell: [i, j], value: t});
                }
            }
        }
//console.log(lg);

        if (l.length == 0) { // if nothing changed
            if (this.timer) {
                this.btnGo.click();
            }
            this.loop = 1;
            //alert("Устойчивое состояние\n(состояние тривиального цикла)");
        }
        
        while(l.length > 0) {
            var t = l.pop();
            this.a[t.cell[0]][t.cell[1]] = t.value;
        }
        
        this.redraw();
    },
    
    redraw: function() {
        $( this.DOMTable ).empty();
        var that = this;
        if (this.loop !== 0) {
            $( this.txtInfo ).text("Длина цикла: "+this.loop);
        } else {
            $( this.txtInfo ).text("");
        }
        for(var i = 0; i < this.height; i++) {
            var tRow = document.createElement('TR');
            for(var j = 0; j < this.width; j++) {
                var tCell = document.createElement('TD');
                tCell.className = 'state' + this.a[i][j];
                tCell.setAttribute('rowNum', i);
                tCell.setAttribute('colNum', j);
                tCell.onclick = function() {
                    var i = this.getAttribute('rowNum');
                    var j = this.getAttribute('colNum');
                    that.a[i][j] = (that.a[i][j] + 1) % that.maxStateValue;
                    //                    console.log(i, j, that.a[i][j]);
                    that.redraw();
                };
                var nbsp = document.createTextNode('');
                tCell.appendChild(nbsp);
                tRow.appendChild(tCell);
            }
            this.DOMTable.appendChild(tRow);
        }
        $('td').removeClass("td8 td16 td32 td64").addClass("td"+that.width);
    },
    
    goSteps: function() {
        var that = this;
        if (this.timer) return;
        this.timer = setInterval(function(){
            if (that.steps > 0) {
                that.steps--;
                that.step();
            } else {
                that.stopSteps();
            }
        }, that.timeT);
    },
    
    stopSteps: function() {
        clearInterval(this.timer);
        this.btnGo.innerHTML = 'Старт';
        this.timer = null;
    },
};
