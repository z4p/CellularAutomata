"use strict";

function CellularAutomaton(domId) {
    this.DOMParent = document.getElementById(domId);
    this.init();
}

CellularAutomaton.prototype = {
    width: 32,
    height: 32,
	maxStateValue: 2,
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
        
        $('#states').empty();
        for(var i = 0; i < this.saves.length; i++) {
            $("<option value=" + i + ">" + this.saves[i].name + "</option>").appendTo( $('#states') );
        }
    },
    
    loadState: function() {
        if($('#states').val() == "") {
            alert("Не выбрано состояние для загрузки");
            return;
        }
        
        var strSave = this.saves[$('#states').val()].state;
        
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
		if($('#states').val() === "") {
            alert("Не выбрано состояние для удаления");
            return;
        }
        var i = $('#states').val();
        
		this.saves.splice(i, 1);
        this.save();
		
		$('#states').empty();
        for(var i = 0; i < this.saves.length; i++) {
            $("<option value=" + i + ">" + this.saves[i].name + "</option>").appendTo($('#states'));
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
        
        $('#saves').empty();
        for(var i = 0; i < this.saves.length; i++) {
            $("<option value=" + i + ">" + this.saves[i].name + "</option>").appendTo($('#states'));
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
            for(var j = 0; j < this.width; j++) {
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
            for(var j = 0; j < this.width; j++) {
                this.a[i][j] = 0;
            }
        }
        
        // таблица-матрица для отрисовки состояний
        this.DOMTable = $('#cellArea')[0];
        
        
        // форма управления
		
        $('#btnSteps').click(function() {
			if(that.timer) {
                that.stopSteps();
                $('#btnStart').text('Старт');
            } else {
                that.steps = parseInt($("#stepCount").val());
                that.goSteps();
                $('#btnSteps').text('Стоп');
            }
        });
        
        $('#btnClear').click(function() {
            for(var i = 0; i < that.height; i++) {
				for(var j = 0; j < that.width; j++) {
					that.a[i][j] = 0;
				}
			}
			that.redraw();
        });
        
        $('#btnFill').click(function() {
            for(var i = 0; i < that.height; i++) {
				for(var j = 0; j < that.width; j++) {
					that.a[i][j] = 1;
				}
			}
			that.redraw();
        });
        
        $('#btnReset').click(function() {
            that.clearArea();
        });
        
		/*
        $('#btnStart').click(function() {
            if(that.timer) {
                that.stopSteps();
                $('#btnStart').text('Старт');
            } else {
                that.steps = 100500;
                that.goSteps();
                $('#btnStart').text('Стоп');
            }
        });
		*/
        
        $('#btnSave').click(function() {
            that.saveState();
        });
        
        $('#btnRestore').click(function() {
            that.loadState();
        });
        
        $('#btnDelete').click(function() {
            that.eraseState();
        });

        $('#btnSoup').click(function() {
            that.randomSoup();
        });
        
        $('#btnNoise').click(function() {
            that.noise();
            that.redraw();
        });
        
        $('#states').dblclick(function() {
			that.loadState();
		});
        
        
        this.rules = [this.ruleSum, this.ruleBurn, this.ruleLife, this.ruleCycle, this.ruleSuCA];
        this.currentRule = this.rules[0];
        
        $('#rule').change(function() {
			that.currentRule = that.rules[$(this).val()];
			console.log($(this).val());
		});
        
		$('#delay').change(function() {
			that.timeT = $(this).val();
		});
        
		$('#statecount').change(function() {
			that.maxStateValue = $(this).val();
		});
        
		$('#size').change(function() {
            if ($(this).val() === 'other') {
                that.width = prompt("Ширина поля","32");
                that.height = prompt("Высота поля","32");
            } else {
                that.width = $(this).val();
                that.height = $(this).val();
            }
			
			that.a = new Array(that.height);
			for(var i = 0; i < that.height; i++) {
				that.a[i] = new Array(that.width);
				for(var j = 0; j < that.width; j++) {
					that.a[i][j] = 0;
				}
			}
			
            that.redraw();
		});
        
        // проверка работы хранилища
        if(typeof(Storage) !== "undefined") {
            this.saveEnabled = true;
        } else {
            alert("Ваш браузер не поддерживает работу с локальным хранилищем.\n"
            +"Функции сохранения и загрузки состояний недоступны!");
            
            $('#btnSave').attr('disabled','disabled');
            $('#btnLoad').attr('disabled','disabled');
            $('#states').attr('disabled','disabled');
        }
        
        this.restore();
        this.redraw();
    },
    
    ruleSum: function(i,j) {
        var c = 0;
        for(var a = i-1; a <= i+1; a++)
            for(var b = j-1; b <= j+1; b++)
                if (a >= 0 && b >= 0 && a < this.height && b < this.width) {
                    c += this.a[a][b];
                }
        return c % this.maxStateValue;
    },
    
    ruleBurn: function(i,j) {
        var c = 0;
        for(var a = i-1; a <= i+1; a++)
            for(var b = j-1; b <= j+1; b++)
                if (a >= 0 && b >= 0 && a < this.height && b < this.width) {
                    c += this.a[a][b];
                }
        return Math.round(c/9);
    },
    
    ruleLife: function(i,j) {
        var c = 0;
        for(var a = i-1; a <= i+1; a++)
            for(var b = j-1; b <= j+1; b++)
                if (a >= 0 && b >= 0 && a < this.height && b < this.width && !(a == i && b == j)) {
                    c += this.a[a][b];
                }
        if (this.a[i][j] === 0 && c == 3) return 1;
        if (this.a[i][j] === 1 && c <= 3 && c >= 2) return 1;
        return 0;
    },
    
    ruleCycle: function(i,j) {
        var c = 0;
        if (i > 0)              c += this.a[i-1][j];
        if (j > 0)              c += this.a[i][j-1];
        if (i < this.height-1)  c += this.a[i+1][j];
        if (j < this.width-1)   c += this.a[i][j+1];

        if (c % 2) return (this.a[i][j] + 1) % this.maxStateValue;
        return this.a[i][j];
    },
    
    ruleSuCA: function(i,j) {
        var c = this.a[i][j];
        
        if (i > 0)              c += this.a[i-1][j];
        if (j > 0)              c += this.a[i][j-1];
        if (i < this.height-1)  c += this.a[i+1][j];
        if (j < this.width-1)   c += this.a[i][j+1];
                
        return c % this.maxStateValue;
    },
    
    noise: function() {
        for(var i = 0; i < this.height; i++) {
            for(var j = 0; j < this.width; j++) {
                if (Math.random() > 0.95) {
                    this.a[i][j] = (this.a[i][j] + 1) % this.maxStateValue;
                }
            }
        }
    },
    
    clearArea: function() {
		this.history = [];
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
                $('#btnSteps').click();
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
		var ticks_text = "Тактов: "+this.ticks;
		
        if (this.loop !== 0) {
            $('#caInfo').text("Длина цикла: "+this.loop+"\n"+ticks_text);
        } else {
            $('#caInfo').text(ticks_text);
        }
        for(var i = 0; i < this.height; i++) {
            var tRow = document.createElement('TR');
            for(var j = 0; j < this.width; j++) {
                var tCell = document.createElement('TD');
				if (isNaN(this.a[i][j])) {
					this.a[i][j] = 0;
				}
                tCell.className = 'state' + this.a[i][j];
                tCell.setAttribute('rowNum', i);
                tCell.setAttribute('colNum', j);
                tCell.onclick = function() {
                    var i = this.getAttribute('rowNum');
                    var j = this.getAttribute('colNum');
					if (isNaN(that.a[i][j])) {
						that.a[i][j] = 0;
					}
                    that.a[i][j] = (that.a[i][j] + 1) % that.maxStateValue;
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
		$('#btnSteps').text('Старт');
        this.timer = null;
    },
};
