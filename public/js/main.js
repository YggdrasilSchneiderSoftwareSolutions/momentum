const time = $('#time');
const greeting = $('#greeting');
const focus = $('#focus');
const name = $('#name');
const date = $('#date');
const qFocus = $('#qfocus');
const mainForm = $('#mainForm');
const todobtn = $('#todobtn');

const DEFAULT_NAME = '[Gib hier Deinen Namen ein + Enter]';
const DEFAULT_FOCUS = '[Gib hier Deinen Fokus ein + Enter]';
const GREET_INITIAL = 'Hallo, wie heißt Du?';
const GREET_MORNING = 'Guten Morgen, ';
const GREET_AFTERNOON = 'Guten Tag, ';
const GREET_EVENING = 'Guten Abend, ';

const Monate = new Array("Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", 
    "Oktober", "November", "Dezember");
const Wochentage = new Array("Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag");

var isNameSet = false;

/**
 * Zeit ermitteln und ggf. zeitrelevante Funktionen triggern
 */
function getTime() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Datum bei Mitternacht anpassen
    if (hours == 0 && minutes == 0 && seconds == 0) {
        showDate();
    }

    // Hintergrund und Begruessung anpassen
    if ((hours == 5 && minutes == 0 && seconds == 0)
        || (hours == 10 && minutes == 0 && seconds == 0)
        || (hours == 19 && minutes == 0 && seconds == 0)) {
            showGreet();
        }
    
    return ((hours < 10) ? "0" + hours : hours) + ":" + ((minutes < 10) ? "0" + minutes : minutes); 
}

function showDate() {
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1; // JS-Monate beginnen bei 0
    let year = today.getFullYear();

    let formattedDate = Wochentage[today.getDay()] + ", " + day + ". " + Monate[month] + " " + year;

    date.text(formattedDate);
}

function showTime() {
    time.text(getTime());
    setTimeout(showTime, 1000); // jede Sekunde aufrufen
}

/**
 * Begruessung und Hintergrundbild in Abhaengigkeit zur Tageszeit setzen
 */
function showGreet() {
    let daytime = new Date().getHours();
    let greetText = '';

    // Morgen
    if (daytime < 10 && daytime > 5) {
        $('body').css("background-image", "url('img/11morning.jpg')");
        $('#date, #time').css("color", "black");
        greetText = GREET_MORNING;
    }
    // Nachmittag/Tag
    else if (daytime > 10 && daytime < 19) {
        $('body').css("background-image", "url('img/21afternoon.jpg')");
        greetText = GREET_AFTERNOON;
    }
    // Abend
    else {
        $('body').css("background-image", "url('img/31night.jpg')");
        greetText = GREET_EVENING;
    }

    // User ist noch nicht gesetzt
    if (!isNameSet) {
        greetText = GREET_INITIAL;
    }

    greeting.text(greetText);
}

function showFocus() {
    let focusText = DEFAULT_FOCUS;
    if (localStorage.getItem('focus') !== null) {
        focusText = localStorage.getItem('focus');
    }

    focus.text(focusText);
}

function showName() {
    let focusName = DEFAULT_NAME;
    if (isNameSet) {
        focusName = localStorage.getItem('name');
    }

    name.text(focusName);
}

function setName(aName) {
    if (aName !== "" && aName !== null) {
        localStorage.setItem('name', aName);
        isNameSet = true;
    }
    showName();
    showGreet();
}

/**
 * Dynamisch Checkbox und Label pro Todo aufbauen. Erledigte durchstreichen.
 * Falls noch keine Todos vorhanden (erster Aufruf), wird eine leere Liste gespeichert.
 */
function showTodos() {
    $('.todolist').html('');
    if (JSON.parse(localStorage.getItem('todos')) === null) {
        localStorage.setItem('todos', JSON.stringify([]));
    }

    let userTodos = JSON.parse(localStorage.getItem('todos'));
    userTodos.forEach((element, index) => {
        let done = element.done == true;
        let todocontent = '<input type="checkbox" name="todo" value="todo' + index + '" id="todo' + index + '"' 
            + 'onclick="markTodo(' + index + ')"> ' 
            + '<label for="todo' + index + '" id="todolabel' + index + '">'+element.description +'</label>' + '<br>';
        $('.todolist').append(todocontent);
        if (done) {
            let todolabelid = '#todolabel' + index;
            let todoid = '#todo'+ index;
            $(todolabelid).css('text-decoration', 'line-through');
            $(todoid).prop('checked', true);
        }
    });
}

/**
 * todo.done = true oder false setzen und speichern. Danach Anzeige neu aufbauen
 * @param {Integer} index 
 */
function markTodo(index) {
    let todoid = '#todo' + index;
    let todolist = JSON.parse(localStorage.getItem('todos'));
    if ($(todoid).prop('checked')) {
        todolist[index].done = true; // Todo wurde als erledigt markiert
    } else {
        todolist[index].done = false; // Todo wurde wieder als unerledigt markiert
    }
    localStorage.setItem('todos', JSON.stringify(todolist));
    showTodos();
}

/**
 * Bei jedem Reload werden die erledigten Todos geloescht
 */
function removeDoneTodos() {
    return new Promise((resolve, reject) => {
        let todolist = JSON.parse(localStorage.getItem('todos'));
        if (todolist !== null) {
            let clearedTodoList = todolist.filter(todo => { 
                return todo.done === false;
            });
            localStorage.setItem('todos', JSON.stringify(clearedTodoList));
            resolve();
        }
    });
}

function init(callback) {
    date.hide();
    time.hide();
    greeting.hide();
    name.hide();
    qFocus.hide();
    focus.hide();
    todobtn.hide();

    isNameSet = localStorage.getItem('name') !== null;

    callback.call();    
}

function startUp() {
    date.fadeIn('400', showDate());
    time.fadeIn('400', showTime());
    greeting.fadeIn('400', showGreet());
    name.fadeIn('400', showName());
    qFocus.fadeIn();
    focus.fadeIn('400', showFocus());
    removeDoneTodos()
        .then(showTodos());
    todobtn.fadeIn('400');
}

function getName() {
    greeting.fadeIn('400', showGreet());
    name.fadeIn('400', showName());
}

$(document).ready(function() {
    init(function() {
        if (!isNameSet) {
            getName();
        } else {
            startUp();
        }
    });

    // Events
    name.keypress(function(e) {
        if (e.which == 13 || e.keyCode == 13) {
            setName(name.text());
            name.blur();
            startUp();
        }
    });

    focus.keypress(function(e) {
        if (e.which == 13 || e.keyCode == 13) {
            localStorage.setItem('focus', focus.text());
            focus.blur();
        }
    });

    mainForm.submit(function(e) {
        e.preventDefault();
        let todo = {
            description: $('#newTodo').val(),
            done: false
        };
        
        let userTodos = JSON.parse(localStorage.getItem('todos'));
        userTodos.push(todo);
        localStorage.setItem('todos', JSON.stringify(userTodos));
        showTodos();
        $('#newTodo').val('');
    });

    /**
     * Markiert den ganzen Namen-Text bei focus
     */
    name.on('focus', function() {
        var cell = this;
        // select all text in contenteditable
        // see http://stackoverflow.com/a/6150060/145346
        var range, selection;
        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(cell);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(cell);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    /**
     * Markiert den ganzen Fokus-Text bei focus
     */
    focus.on('focus', function() {
        var cell = this;
        // select all text in contenteditable
        // see http://stackoverflow.com/a/6150060/145346
        var range, selection;
        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(cell);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(cell);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
});

function submitForm() {
    mainForm.submit();
}

/* Set the width of the sidebar to 250px (show it) */
function openNav() {
    document.getElementById("mySidepanel").style.width = "400px";
}
  
/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}