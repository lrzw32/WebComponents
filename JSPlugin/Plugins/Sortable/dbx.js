// DBX3.0 :: Docking Boxes (dbx)
// *****************************************************
// DOM scripting by brothercake -- http://www.brothercake.com/
// GNU Lesser General Public License -- http://www.gnu.org/licenses/lgpl.html
//******************************************************
var dbx;

function dbxManager(sid, useid, hide, buttontype) {
    dbx = this;
    if (!/^[-_a-z0-9]+$/i.test(sid)) {
        throw ('Error from dbxManager:\n"' + sid + '" is an invalid session ID');
        return;
    }
    this.kde = navigator.vendor == 'KDE';
    this.safari = navigator.vendor == 'Apple Computer, Inc.';
    this.chrome = navigator.vendor == 'Google Inc.';
    this.opera = typeof window.opera != 'undefined';
    this.msie = typeof document.uniqueID != 'undefined';
    this.supported = (!(typeof document.getElementsByTagName == 'undefined' || document.getElementsByTagName('*').length == 0 || (this.kde && typeof window.sidebar == 'undefined') || (this.opera && parseFloat(navigator.userAgent.toLowerCase().split(/opera[\/ ]/)[1].split(' ')[0], 10) < 8)));
    if (!this.supported) {
        return;
    }
    this.etype = typeof document.addEventListener != 'undefined' ? 'addEventListener' : typeof document.attachEvent != 'undefined' ? 'attachEvent' : 'none';
    if (this.etype == 'none') {
        this.supported = false;
        return;
    }
    this.eprefix = (this.etype == 'attachEvent' ? 'on' : '');
    this.sid = sid;
    this.cookiename = 'dbx-' + this.sid + '=';
    this.useid = typeof useid != 'undefined' && useid == 'yes' ? true : false;
    this.hide = typeof hide != 'undefined' && hide == 'no' ? false : true;
    this.buttontype = typeof buttontype != 'undefined' && buttontype == 'button' ? 'button' : 'link';
    this.running = 0;
    this.gnumbers = {};
    this.max = 0;
    this.rootcookie = '';
    if (document.cookie && document.cookie.indexOf(this.cookiename) != -1) {
        this.rootcookie = document.cookie.split(this.cookiename)[1].split(';')[0];
        this.rootcookie = this.rootcookie.replace(/\|/g, ',').replace(/:/g, '=');
        if (this.rootcookie.indexOf('+') == -1) {
            this.rootcookie = this.rootcookie.replace(/(,|$|&)/ig, '+$1').replace(/(\-\+)/g, '-');
        }
    }
    this.savedata = {};
    this.cookiestate = this.getCookieState();
};
dbxManager.prototype.setCookieState = function () {
    var now = new Date();
    now.setTime(now.getTime() + (365 * 24 * 60 * 60 * 1000));
    this.compileStateString();
    this.cookiestring = this.state.replace(/,/g, '|').replace(/=/g, ':').replace(/\+/g, '');
    if (typeof this.onstatechange == 'undefined' || this.onstatechange()) {
        document.cookie = this.cookiename + this.cookiestring + '; expires=' + now.toGMTString() + '; path=/';
    }
};
dbxManager.prototype.getCookieState = function () {
    this.cookiestate = null;
    if (document.cookie) {
        if (document.cookie.indexOf(this.cookiename) != -1) {
            this.cookie = document.cookie.split(this.cookiename)[1].split(';')[0].split('&');
            for (var i in this.cookie) {
                if (this.unwanted(this.cookie, i)) {
                    continue;
                }
                this.cookie[i] = this.cookie[i].replace(/\|/g, ',');
                this.cookie[i] = this.cookie[i].replace(/:/g, '=');
                if (this.cookie[i].indexOf('+') == -1) {
                    this.cookie[i] = this.cookie[i].replace(/(,|$|&)/ig, '+$1').replace(/(\-\+)/g, '-');
                }
                this.cookie[i] = this.cookie[i].split('=');
                this.cookie[i][1] = this.cookie[i][1].split(',');
            }
            this.cookiestate = {};
            for (i in this.cookie) {
                if (this.unwanted(this.cookie, i)) {
                    continue;
                }
                this.cookiestate[this.cookie[i][0]] = this.cookie[i][1];
            }
        }
    }
    return this.cookiestate;
};
dbxManager.prototype.compileStateString = function () {
    var str = '';
    for (var j in this.savedata) {
        if (this.unwanted(this.savedata, j)) {
            continue;
        }
        str += j + '=' + this.savedata[j] + '&'
    }
    this.state = str.replace(/^(.+)&$/, '$1');
};
dbxManager.prototype.createElement = function (tag) {
    return typeof document.createElementNS != 'undefined' ? document.createElementNS('http://www.w3.org/1999/xhtml', tag) : document.createElement(tag);
};
dbxManager.prototype.getTarget = function (e, pattern, node) {
    if (typeof node != 'undefined') {
        var target = node;
    } else {
        target = typeof e.target != 'undefined' ? e.target : e.srcElement;
    }
    while (!this.hasClass(target, pattern)) {
        target = target.parentNode;
        if (this.hasClass(target, 'dbx\-group') && !this.hasClass(target, pattern)) {
            return null;
        }
    }
    return target;
};
dbxManager.prototype.getID = function (element) {
    if (!element || !element.className) {
        return null;
    } else if (this.hasClass(element, 'dbx\-dummy')) {
        return 'dummy';
    }
    var cname = element.className.split('dbxid-');
    if (cname.length == 1) {
        return null;
    }
    return cname[1].replace(/^([a-zA-Z0-9_]+).*$/, '$1');
};
dbxManager.prototype.getSiblingBox = function (root, sibling) {
    var node = root[sibling];
    while (node && !this.hasClass(node, 'dbx\-box')) {
        node = node[sibling];
    }
    if (!node) {
        node = root;
    }
    return node;
};
dbxManager.prototype.getPosition = function (obj, center) {
    var position = {
        'left': obj.offsetLeft,
        'top': obj.offsetTop
    };
    var tmp = obj.offsetParent;
    while (tmp) {
        position.left += tmp.offsetLeft;
        position.top += tmp.offsetTop;
        tmp = tmp.offsetParent;
    }
    if (center) {
        position.left += obj.offsetWidth / 2;
        position.top += obj.offsetHeight / 2;
    }
    return position;
};
dbxManager.prototype.getViewportWidth = function () {
    return typeof window.innerWidth != 'undefined' ? window.innerWidth : (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) ? document.documentElement.clientWidth : this.get('body')[0].clientWidth;
};
dbxManager.prototype.compileAndDispatchOnBeforeStateChange = function () {
    var actions = {};
    for (var i = 0; i < arguments.length; i++) {
        var data = arguments[i];
        this.dbxobject = data[1];
        this.group = data[2];
        this.gid = data[3];
        this.sourcebox = data[4];
        this.target = data[5];
        this.action = data[6];
        actions[data[0]] = this.onbeforestatechange();
    }
    return actions;
};
dbxManager.prototype.compileAndDispatchOnAnimate = function (box, clone, caller, count, res) {
    dbx.sourcebox = box;
    dbx.clonebox = clone;
    dbx.dbxobject = caller;
    dbx.group = caller.container;
    dbx.anicount = count - 1;
    dbx.anilength = res - 1;
    dbx.onanimate();
};
dbxManager.prototype.compileAndDispatchOnAfterAnimate = function (box, caller) {
    dbx.sourcebox = box;
    dbx.dbxobject = caller;
    dbx.group = caller.container;
    dbx.onafteranimate();
};
dbxManager.prototype.unwanted = function (obj, i) {
    return (!obj.hasOwnProperty(i) || typeof obj[i] == 'undefined' || typeof obj[i] == 'function' || i == 'length');
};
dbxManager.prototype.addEvent = function (node, type, handler) {
    node[this.etype](this.eprefix + type, handler, false);
};
dbxManager.prototype.trim = function (str) {
    return str.replace(/^\s+|\s+$/g, "");
};
dbxManager.prototype.empty = function (data) {
    if (typeof data == 'string' && this.trim(data) === '') {
        return true;
    } else if (typeof data == 'object') {
        if (data instanceof Array && data.length == 0) {
            return true;
        } else {
            var n = 0;
            for (var i in data) {
                if (!data.hasOwnProperty(i)) {
                    continue;
                }
                n++;
            }
            if (n == 0) {
                return true;
            }
        }
    }
    return false;
};
dbxManager.prototype.hasClass = function (element, pattern) {
    return (element.className && new RegExp(pattern + '($|[ ])').test(element.className));
};
dbxManager.prototype.removeClass = function (element, pattern) {
    if (typeof flags == 'undefined') {
        flags = '';
    }
    element.className = element.className.replace(new RegExp(pattern, 'g'), '');
    if (!/\S/.test(element.className)) {
        element.className = '';
    }
    return element;
};
dbxManager.prototype.get = function (find, context) {
    var nodes = [];
    if (/(previous|next|first|last)(Sibling|Child)/.test(find)) {
        context = context[find];
        switch (find) {
            case 'nextSibling':
            case 'previousSibling':
                while (context && context.nodeType != 1) {
                    context = context[find];
                }
                break;
        }
        return context;
    } else if (find.indexOf('#') != -1) {
        return document.getElementById(find.split('#')[1]);
    } else {
        if (typeof context == 'undefined') {
            context = document;
        }
        return context.getElementsByTagName(find);
    }
};

function dbxGroup() {
    if (!dbx.supported) {
        return;
    }
    var args = arguments;
    if (!/^[-_a-z0-9]+$/i.test(args[0]) || args[0] == 'deleted') {
        throw ('Error from dbxGroup:\n"' + args[0] + '" is an invalid container ID');
        return;
    }
    this.container = dbx.get('#' + args[0]);
    if (!dbx.hasClass(this.container, 'dbx\-group')) {
        throw ('Error from dbxGroup:\nGroup container (the element with id="' + args[0] + '") must contain the class name "dbx-group"');
        return;
    }
    if (!this.container) {
        return;
    }
    this.gid = args[0];
    this.cacheDynamicClasses();
    if (typeof dbx.onbeforestatechange != 'undefined') {
        var actions = dbx.compileAndDispatchOnBeforeStateChange(['proceed', this, this.container, this.gid, null, null, 'load']);
        if (!actions.proceed) {
            this.container = null;
            return;
        }
    }
    this.orientation = /^(freeform|confirm|horizontal|vertical|insert(\-swap|\-insert)?)/.test(args[1]) ? args[1] : 'freeform';
    if (this.orientation == 'insert') {
        this.orientation = 'freeform-insert';
    }
    this.exchange = 'swap';
    if (/(freeform|confirm)\-insert/.test(this.orientation)) {
        this.exchange = 'insert';
    }
    this.orientation = this.orientation.split('-')[0];
    this.confirm = false;
    if (this.orientation == 'confirm') {
        this.confirm = true;
        this.orientation = 'freeform';
    }
    this.threshold = parseInt(args[2], 10);
    if (isNaN(this.threshold)) {
        this.threshold = 0;
    }
    this.restrict = args[3] == 'yes' ? this.orientation : '';
    this.resolution = parseInt(args[4], 10);
    if (isNaN(this.resolution)) {
        this.resolution = 0;
    }
    if (this.resolution == 0) {
        this.resolution = 1;
    }
    this.toggles = args[5] == 'yes';
    this.defopen = args[6] != 'closed';
    this.vocab = {
        'open': args[7],
        'close': args[8],
        'move': args[9],
        'toggle': args[10],
        'kmove': args[11],
        'ktoggle': args[12],
        'syntax': args[13],
        'kyes': (typeof args[14] != 'undefined' ? args[14] : ''),
        'kno': (typeof args[15] != 'undefined' ? args[15] : '')
    };
    var self = this;
    this.dragok = false;
    this.box = null;
    this.dialog = null;
    this.buffer = null;
    this.last = {
        'box': null,
        'direction': null
    };
    this.child = {
        'first': null,
        'last': null
    };
    this.keytimer = null;
    this.currentdir = null;
    this.rules = {
        'global': {
            'pointer': 0,
            'rule': [],
            'actual': []
        }
    };
    this.rulekey = '';
    this.ruledir = '';
    this.container.style.position = 'relative';
    this.container.style.display = 'block';
    this.initBoxes(true, true);
    this.keydown = false;
    this.mouseisdown = false;
    dbx.addEvent(document, 'mouseout', function (e) {
        if (typeof e.target == 'undefined') {
            e.relatedTarget = e.toElement;
        }
        if (e.relatedTarget == null) {
            self.mouseup(e);
        }
    });
    dbx.addEvent(document, 'mousemove', function (e) {
        self.hover(e);
        self.mousemove(e);
        return !self.dragok;
    });
    dbx.addEvent(document, 'mousedown', function (e) {
        self.mouseisdown = true;
    });
    dbx.addEvent(document, 'mouseup', function (e) {
        self.mouseisdown = false;
        self.mouseup(e);
    });
    dbx.addEvent(document, 'keydown', function (e) {
        self.keydown = true;
        if (self.dialog && !/^((3[7-9])|40|13|(1[6-8]))$/.test(e.keyCode)) {
            self.clearDialog();
        }
    });
    dbx.addEvent(document, 'keyup', function () {
        self.keydown = false;
        self.currentdir = null;
        self.removeActiveClasses('dbx\-box\-active');
    });
};
dbxGroup.prototype.initBoxes = function (recover, getspare) {
    this.boxes = {
        'length': 0
    };
    this.handles = [];
    this.buttons = {};
    this.order = [];
    var self = this;
    this.eles = dbx.get('*', this.container);
    for (var i = 0; i < this.eles.length; i++) {
        var dbxid = this.boxes.length;
        if (dbx.hasClass(this.eles[i], 'dbx\-box') && !dbx.hasClass(this.eles[i], 'dbx\-(dummy|clone)')) {
            if (dbx.useid) {
                if (/^[a-z][a-z0-9]*$/i.test(this.eles[i].id) && !/^(length|dummy)$/.test(this.eles[i].id)) {
                    dbxid = this.eles[i].id;
                } else if (this.eles[i].id != '') {
                    throw ('Error from dbxGroup:\n"' + this.eles[i].id + '" is an invalid box ID');
                    return;
                }
            }
            this.boxes[dbxid] = this.eles[i];
            this.boxes.length++;
            this.order.push(dbxid + '+');
            if (typeof this.eles[i].hashandlers == 'undefined') {
                dbx.addEvent(this.eles[i], 'mousedown', function (e) {
                    if (!e) {
                        e = window.event;
                    }
                    self.mousedown(e, dbx.getTarget(e, 'dbx\-box'));
                });
                this.eles[i].hashandlers = true;
            }
            if (typeof this.eles[i].processed != 'undefined') {
                continue;
            }
            this.eles[i].style.position = 'relative';
            this.eles[i].style.display = 'block';
            this.eles[i].className += ' dbx-box-open';
            this.eles[i].className += ' dbxid-' + dbxid;
            this.eles[i].processed = true;
        }
        if (dbx.hasClass(this.eles[i], 'dbx\-handle')) {
            this.handles.push(this.eles[i]);
            var parentbox = dbx.getTarget(null, 'dbx\-box', this.eles[i]);
            if (this.toggles) {
                dbxid = dbx.getID(parentbox);
                this.buttons[dbxid] = this.addToggleBehavior(this.eles[i]);
            } else if (typeof this.eles[i].hashandlers == 'undefined') {
                var handle = this.eles[i];
                handle.hasfocus = dbx.opera || dbx.safari ? null : false;
                if (!dbx.hasClass(parentbox, 'dbx\-nograb')) {
                    dbx.addEvent(handle, 'key' + (dbx.msie || dbx.safari || dbx.chrome ? 'down' : 'press'), function (e) {
                        if (!e) {
                            e = window.event;
                        }
                        return self.keypress(e, dbx.getTarget(e, 'dbx\-handle'));
                    });
                    dbx.addEvent(handle, 'click', function (e) {
                        if (self.dialog) {
                            self.click(e, dbx.getTarget(e, 'dbx\-handle'));
                            if (typeof e.preventDefault != 'undefined') {
                                e.preventDefault();
                            } else {
                                return false;
                            }
                        }
                    });
                }
                dbx.addEvent(handle, 'focus', function (e) {
                    if (!e) {
                        e = window.event;
                    }
                    var parentbox = dbx.getTarget(e, 'dbx\-box');
                    if (self.keydown || (dbx.kde && !self.mouseisdown)) {
                        parentbox.className += ' dbx-box-focus';
                    }
                    var handle = dbx.getTarget(e, 'dbx\-handle');
                    var tooltiptext = self.vocab.kmove;
                    if (dbx.hasClass(parentbox, 'dbx\-nograb')) {
                        tooltiptext = handle.getAttribute('oldtitle');
                    } else if (!dbx.empty(handle.getAttribute('oldtitle'))) {
                        tooltiptext = self.vocab.syntax.replace(/%mytitle[%]?/, handle.getAttribute('oldtitle')).replace(/%dbxtitle[%]?/, tooltiptext)
                    }
                    if (!dbx.empty(tooltiptext)) {
                        self.createTooltip(tooltiptext, handle, (self.keydown || (dbx.kde && !self.mouseisdown)));
                    }
                    if (handle.hasfocus !== null) {
                        handle.hasfocus = true;
                    }
                });
                dbx.addEvent(handle, 'blur', function (e) {
                    if (!e) {
                        e = window.event;
                    }
                    dbx.removeClass(dbx.getTarget(e, 'dbx\-box'), 'dbx\-box\-focus');
                    self.removeTooltip();
                    var handle = dbx.getTarget(e, 'dbx\-handle');
                    if (handle.hasfocus !== null) {
                        handle.hasfocus = false;
                    }
                });
                this.eles[i].hashandlers = true;
            }
            if (typeof this.eles[i].processed != 'undefined') {
                continue;
            }
            var oldtitle = this.eles[i].getAttribute('title');
            if (oldtitle) {
                this.eles[i].setAttribute('oldtitle', oldtitle);
            }
            this.eles[i].style.position = 'relative';
            this.eles[i].style.display = 'block';
            if (!dbx.hasClass(parentbox, 'dbx\-nograb')) {
                this.eles[i].className += ' dbx-handle-cursor';
                this.eles[i].setAttribute('title', dbx.empty(this.eles[i].getAttribute('title')) ? this.vocab.move : this.vocab.syntax.replace(/%mytitle[%]?/, this.eles[i].title).replace(/%dbxtitle[%]?/, this.vocab.move));
            }
            this.eles[i].processed = true;
        }
        if (dbx.msie && dbx.hasClass(this.eles[i], 'dbx\-(content|box)')) {
            this.eles[i].runtimeStyle.zoom = '1.0';
        }
    }
    this.updateChildClasses();
    dbx.savedata[this.gid] = this.order.join(',');
    var dummy = this.container.appendChild(dbx.createElement('span'));
    dummy.className = 'dbx-box dbx-dummy';
    dummy.style.display = 'block';
    dummy.style.width = '0';
    dummy.style.height = '0';
    dummy.style.overflow = 'hidden';
    dummy.className += ' dbx-offdummy';
    dbxid = this.boxes.length;
    if (typeof dbx.gnumbers[this.gid] != 'undefined') {
        dbxid += '_' + dbx.gnumbers[this.gid];
    }
    this.boxes[dbxid] = dummy;
    this.boxes.length++;
    if (!recover) {
        return;
    }
    if (dbx.cookiestate && typeof dbx.cookiestate[this.gid] != 'undefined') {
        var num = dbx.cookiestate[this.gid].length;
        for (i = 0; i < num; i++) {
            var index = dbx.cookiestate[this.gid][i].replace(/[\-\+]/g, '');
            if (typeof this.boxes[index] != 'undefined' && this.boxes[index] != dummy) {
                this.container.insertBefore(this.boxes[index], dummy);
                if (this.toggles && /\-$/.test(dbx.cookiestate[this.gid][i])) {
                    if (typeof this.buttons[index] != 'undefined') {
                        this.toggleBoxState(this.buttons[index], false, false, true);
                    }
                }
            }
        }
        this.regenerateBoxOrder();
    } else if (!this.defopen && this.toggles) {
        for (i in this.buttons) {
            if (dbx.unwanted(this.buttons, i)) {
                continue;
            }
            this.toggleBoxState(this.buttons[i], true, false, null);
        }
    }
};
dbxGroup.prototype.cacheDynamicClasses = function () {
    var eles = [],
        classes = ['dbx-tooltip', 'dbx-dragclone', 'dbx-dialog'];
    for (var i = 0; i < classes.length; i++) {
        eles[i] = dbx.createElement('div');
        eles[i].className = 'dbx-clone ' + classes[i];
        this.container.appendChild(eles[i]);
    }
    setTimeout(function () {
        for (var i = 0; i < eles.length; i++) {
            if (eles[i].parentNode) {
                eles[i].parentNode.removeChild(eles[i]);
            }
        }
    }, 100);
};
dbxGroup.prototype.addToggleBehavior = function () {
    var self = this;
    var existing = dbx.get((dbx.buttontype == 'link' ? 'a' : 'button'), arguments[0]);
    for (var i = 0; i < existing.length; i++) {
        if (dbx.hasClass(existing[i], 'dbx\-toggle')) {
            var button = existing[i];
            break;
        }
    }
    if (typeof button == 'undefined') {
        if (dbx.buttontype == 'link') {
            button = arguments[0].appendChild(dbx.createElement('a'));
            button.appendChild(document.createTextNode('\u00a0'));
            button.href = 'javascript:void(null)';
        } else {
            button = arguments[0].appendChild(dbx.createElement('button'));
        }
        button.className = 'dbx-toggle dbx-toggle-open';
        button.setAttribute('title', this.vocab.toggle.replace(/%toggle[%]?/, this.vocab.close));
    }
    button.style.cursor = 'pointer';
    button.hasfocus = dbx.opera || dbx.safari || dbx.chrome ? null : false;
    this.tooltip = null;
    if (typeof button.hashandlers == 'undefined') {
        button.onclick = function (e) {
            self.click(e, this);
            return false;
        };
        button['onkey' + (dbx.msie || dbx.safari || dbx.chrome ? 'down' : 'press')] = function (e) {
            if (!e) {
                e = window.event;
            }
            return self.keypress(e, this);
        };
        button.onfocus = function () {
            for (var i in self.buttons) {
                if (dbx.unwanted(self.buttons, i)) {
                    continue;
                }
                self.buttons[i] = dbx.removeClass(self.buttons[i], '(dbx\-toggle\-hilite\-)(open|closed)');
            }
            var isopen = dbx.hasClass(this, 'dbx\-toggle\-open');
            this.className += ' dbx-toggle-hilite-' + (isopen ? 'open' : 'closed');
            if (self.keydown || (dbx.kde && !self.mouseisdown)) {
                dbx.getTarget(null, 'dbx\-box', this).className += ' dbx-box-focus';
            }
            var tooltiptext = (!dbx.hasClass(dbx.getTarget(null, 'dbx\-box', this), 'dbx\-nograb') ? self.vocab.kmove : '') + self.vocab.ktoggle.replace(/%toggle[%]?/, (isopen ? self.vocab.close : self.vocab.open));
            var handle = dbx.getTarget(null, 'dbx\-handle', this);
            if (!dbx.empty(handle.getAttribute('oldtitle'))) {
                tooltiptext = self.vocab.syntax.replace(/%mytitle[%]?/, handle.getAttribute('oldtitle')).replace(/%dbxtitle[%]?/, tooltiptext)
            }
            self.createTooltip(tooltiptext, this, (self.keydown || (dbx.kde && !self.mouseisdown)));
            this.isactive = true;
            if (this.hasfocus !== null) {
                this.hasfocus = true;
            }
        };
        button.onblur = function () {
            button = dbx.removeClass(button, '(dbx\-toggle\-hilite\-)(open|closed)');
            dbx.removeClass(dbx.getTarget(null, 'dbx\-box', this), 'dbx\-box\-focus');
            self.removeTooltip();
            if (this.hasfocus !== null) {
                this.hasfocus = false;
            }
        };
        button.hashandlers = true;
    }
    return button;
};
dbxGroup.prototype.toggleBoxState = function (button, regen, manual, forcestate) {
    var isopen = dbx.hasClass(button, 'dbx\-toggle\-open');
    if (forcestate !== null) {
        isopen = forcestate;
    }
    var parent = dbx.getTarget(null, 'dbx\-box', button);
    dbx.sourcebox = parent;
    dbx.toggle = button;
    dbx.dbxobject = this;
    if (typeof dbx.container == 'undefined') {
        dbx.group = dbx.getTarget(null, 'dbx\-group', parent);
    } else {
        dbx.group = dbx.container;
    }
    if (typeof dbx.onbeforestatechange != 'undefined') {
        var actions = dbx.compileAndDispatchOnBeforeStateChange(['proceed', this, this.container, this.gid, parent, button, (isopen ? 'close' : 'open')]);
        if (!actions.proceed) {
            return;
        }
    }
    if (manual == false || (!isopen && (typeof dbx.onboxopen == 'undefined' || dbx.onboxopen())) || (isopen && (typeof dbx.onboxclose == 'undefined' || dbx.onboxclose()))) {
        button.className = 'dbx-toggle dbx-toggle-' + (isopen ? 'closed' : 'open');
        button.title = this.vocab.toggle.replace(/%toggle[%]?/, isopen ? this.vocab.open : this.vocab.close);
        if (manual && typeof button.isactive != 'undefined') {
            button.className += ' dbx-toggle-hilite-' + (isopen ? 'closed' : 'open')
        }
        parent.className = parent.className.replace(/[ ](dbx-box-)(open|closed)/, ' $1' + (isopen ? 'closed' : 'open'));
        if (regen) {
            this.regenerateBoxOrder();
        }
    }
};
dbxGroup.prototype.moveBoxByKeyboard = function (e, anchor, parent, direction, confirm, manual) {
    dbx.dbxobject = this;
    dbx.group = this.container;
    dbx.gid = this.gid;
    dbx.sourcebox = parent;
    dbx.clonebox = null;
    dbx.event = e;
    var index = '-';
    this.positive = /[se]/i.test(direction);
    if (/^(Sw)$/.test(direction)) {
        this.positive = false;
    }
    this.removeActiveClasses('dbx\-box\-(target|active)');
    var clonepoint = {
        'x': parent.offsetLeft,
        'y': parent.offsetTop
    };
    var differences = [];
    var boxes = this.boxes;
    for (var i in boxes) {
        if (dbx.unwanted(boxes, i) || dbx.hasClass(boxes[i], 'dbx\-dummy')) {
            continue;
        }
        var boxpoint = {
            'x': boxes[i].offsetLeft,
            'y': boxes[i].offsetTop
        };
        differences.push([i, boxpoint.x - clonepoint.x, boxpoint.y - clonepoint.y]);
        if (parent == boxes[i]) {
            index = i;
        }
    }
    var splitdiffs = {
        'positive': [],
        'negative': []
    };
    var n = /[ew]/i.test(direction) ? 1 : 2;
    for (i = 0; i < differences.length; i++) {
        if (differences[i][0] == index) {
            continue;
        }
        if (differences[i][n] >= 0) {
            splitdiffs.positive.push(differences[i]);
        } else {
            splitdiffs.negative.push(differences[i]);
        }
    }
    var ary = this.positive ? splitdiffs.positive : splitdiffs.negative;
    ary.sort(function (a, b) {
        return Math.abs(a[n]) - Math.abs(b[n]);
    });
    for (i = 0; i < ary.length; i++) {
        if (ary[i][n] == 0) {
            ary.splice(i--, 1);
        }
    }
    if (direction.length > 1) {
        for (i = 0; i < ary.length; i++) {
            if ((/[ew]/i.test(direction) && ary[i][2] == 0) || (/[ns]/i.test(direction) && ary[i][1] == 0) || (/(N[ew])/.test(direction) && ary[i][2] > 0) || (/(S[ew])/.test(direction) && ary[i][2] < 0)) {
                ary.splice(i--, 1);
            }
        }
    }
    for (i = 0; i < ary.length; i++) {
        if (this.positive) {
            if (i > 0 && Math.abs(ary[i][n]) != Math.abs(ary[0][n])) {
                ary.splice(i--, 1);
            }
        } else {
            if (i > 0 && ary[i][n] != ary[0][n]) {
                ary.splice(i--, 1);
            }
        }
    }
    n = n == 1 ? 2 : 1;
    ary.sort(function (a, b) {
        return Math.abs(a[n]) - Math.abs(b[n]);
    });
    if (ary.length == 0) {
        index = '-';
    } else {
        index = ary[0][0];
    }
    var box = dbx.getTarget(null, 'dbx\-box', anchor);
    if (index == '-') {
        return false;
    }
    var targetbox = boxes[index];
    if (this.exchange == 'insert' && this.confirm == false && this.positive == true) {
        targetbox = dbx.get('nextSibling', targetbox);
        if (!targetbox) {
            targetbox = boxes[index];
        }
    }
    if (typeof dbx.onboxdrag == 'undefined' || dbx.onboxdrag()) {
        if (box != targetbox && boxes == this.boxes) {
            var origpoint = {
                'x': box.offsetLeft + (box.offsetWidth / 2),
                'y': box.offsetTop + (box.offsetHeight / 2)
            };
            var boxpoint = {
                'x': targetbox.offsetLeft + (targetbox.offsetWidth / 2),
                'y': targetbox.offsetTop + (targetbox.offsetHeight / 2)
            };
            var testblocks = this.getBlocksDifference(origpoint, boxpoint, box);
            var testcompass = this.getCompassDirection(origpoint, boxpoint);
            if (this.functionExists('_testRules') && !this._testRules(testcompass, testblocks, box, null)) {
                if (confirm || this.dialog) {
                    this.updateDialog(targetbox, ' dbx-dialog-no', null, null, 'keyboard');
                    if (this.vocab.kno != '') {
                        this.createTooltip(this.vocab.kno, box, true);
                    }
                }
                if (manual) {
                    this.refocus(anchor);
                }
                return false;
            }
        }
        if (box != targetbox && !dbx.hasClass(targetbox, 'dbx\-(dialog|dummy)')) {
            targetbox.className += ' dbx-box-target';
        }
        if (confirm || this.dialog) {
            var diffs = null,
                group = null;
            if (boxes != this.boxes) {
                group = this.dialog.group;
                var groupcontainer = dbx.getPosition(group.container, false);
                var callcontainer = dbx.getPosition(this.container, false);
                var diffs = {
                    'x': groupcontainer.left - callcontainer.left,
                    'y': groupcontainer.top - callcontainer.top
                };
            }
            this.updateDialog(targetbox, ' dbx-dialog-yes', diffs, group, 'keyboard');
            if (this.vocab.kyes != '') {
                this.createTooltip(this.vocab.kyes, box, true);
            }
            if (manual) {
                this.refocus(anchor);
            }
            return false;
        }
        if (this.exchange == 'swap') {
            return this.swapTwoBoxes(parent, targetbox, anchor, manual, this.positive);
        } else {
            return this.insertTwoBoxes(parent, targetbox, anchor, manual, direction);
        }
    }
    return false;
};
dbxGroup.prototype.insertTwoBoxes = function (original, selected, anchor, manual, positive) {
    if (typeof dbx.onbeforestatechange != 'undefined') {
        var actions = dbx.compileAndDispatchOnBeforeStateChange(['proceed', this, this.container, this.gid, original, selected, 'insert']);
        if (!actions.proceed) {
            return false;
        }
    }
    if (this.functionExists('_updateRulePointer')) {
        this._updateRulePointer();
    }
    var add = false,
        pointer = 0,
        theboxes = [],
        visiboxes = [];
    for (var i in this.boxes) {
        if (dbx.unwanted(this.boxes, i)) {
            continue;
        }
        theboxes.push(this.boxes[i]);
    }
    for (i = 0; i < theboxes.length; i++) {
        if (theboxes[i] == original) {
            continue;
        }
        visiboxes.push(theboxes[i]);
    }
    var visiposes = [];
    for (i = 0; i < visiboxes.length; i++) {
        visiposes.push({
            'x': visiboxes[i].offsetLeft,
            'y': visiboxes[i].offsetTop
        });
    }
    var originalpos = {
        'x': original.offsetLeft,
        'y': original.offsetTop
    };
    original.style.visibility = 'hidden';
    selected = dbx.removeClass(selected, 'dbx\-box\-target');
    selected.parentNode.insertBefore(original, selected);
    if (typeof visiboxes != 'undefined' && visiboxes.length > 0) {
        for (i = 0; i < visiboxes.length; i++) {
            new dbxAnimator(this, visiboxes[i], visiposes[i], this.resolution, false, null, true);
        }
    }
    new dbxAnimator(this, original, originalpos, this.resolution, true, anchor, manual);
    this.regenerateBoxOrder();
    return true;
};
dbxGroup.prototype.swapTwoBoxes = function (original, selected, anchor, manual, positive) {
    if (typeof dbx.onbeforestatechange != 'undefined') {
        var actions = dbx.compileAndDispatchOnBeforeStateChange(['proceed', this, this.container, this.gid, original, (this.orientation != 'freeform' && positive ? dbx.getSiblingBox(selected, 'nextSibling') : selected), (this.orientation == 'freeform' ? 'swap' : 'move')]);
        if (!actions.proceed) {
            return false;
        }
    }
    if (this.functionExists('_updateRulePointer')) {
        this._updateRulePointer();
    }
    var selectedpos = {
        'x': selected.offsetLeft,
        'y': selected.offsetTop
    };
    var originalpos = {
        'x': original.offsetLeft,
        'y': original.offsetTop
    };
    original.style.visibility = 'hidden';
    selected.style.visibility = 'hidden';
    selected = dbx.removeClass(selected, 'dbx\-box\-target');
    var next = selected.nextSibling;
    if (next == original) {
        selected.parentNode.insertBefore(original, selected);
    } else {
        original.parentNode.insertBefore(selected, original);
        next.parentNode.insertBefore(original, next);
    }
    new dbxAnimator(this, selected, selectedpos, this.resolution, true, null, false);
    new dbxAnimator(this, original, originalpos, this.resolution, true, anchor, manual);
    this.regenerateBoxOrder();
    return true;
};
dbxGroup.prototype.createTooltip = function (text, anchor, okay, cname) {
    if (okay) {
        this.tooltip = this.container.appendChild(dbx.createElement('span'));
        this.tooltip.style.visibility = 'hidden';
        this.tooltip.className = 'dbx-tooltip';
        this.tooltip.appendChild(document.createTextNode(text));
        var parent = dbx.getTarget(null, 'dbx\-box', anchor);
        this.tooltip.style.left = parseInt(parent.offsetLeft, 10) + 'px';
        this.tooltip.style.top = parseInt(parent.offsetTop, 10) + 'px';
        var position = dbx.getPosition(this.tooltip);
        var viewsize = dbx.getViewportWidth();
        var tipsize = this.tooltip.offsetWidth;
        if (position.left + tipsize > viewsize) {
            this.tooltip.style.left = parseInt(parent.offsetLeft - (position.left + tipsize - viewsize), 10) + 'px';
        }
        var tooltip = this.tooltip;
        window.setTimeout(function () {
            if (tooltip != null) {
                tooltip.style.visibility = 'visible';
            }
        }, 400);
    }
};
dbxGroup.prototype.removeTooltip = function () {
    if (this.tooltip) {
        this.tooltip.parentNode.removeChild(this.tooltip);
        this.tooltip = null;
    }
};
dbxGroup.prototype.hover = function (e) {
    if (!this.keydown || (dbx.kde && !this.mouseisdown)) {
        var found = false,
            target = typeof e.target != 'undefined' ? e.target : e.srcElement;
        for (var i = 0; i < this.handles.length; i++) {
            if (this.contains(this.handles[i], target)) {
                found = true;
                var parentbox = dbx.getTarget(null, 'dbx\-box', this.handles[i]);
                if (!dbx.hasClass(parentbox, 'dbx\-box\-hover')) {
                    if (typeof this.hoverbox != 'undefined') {
                        this.hoverbox = dbx.removeClass(this.hoverbox, 'dbx\-box\-hover');
                    }
                    this.hoverbox = parentbox;
                    parentbox.className += ' dbx-box-hover';
                }
                break;
            }
        }
        if (!found) {
            if (typeof this.hoverbox != 'undefined') {
                this.hoverbox = dbx.removeClass(this.hoverbox, 'dbx\-box\-hover');
                delete this.hoverbox;
            }
        }
    }
};
dbxGroup.prototype.refresh = function (recover) {
    if (!dbx.supported) {
        return;
    }
    if (typeof recover == 'undefined') {
        recover = false;
    }
    this.eles = dbx.get('*', this.container);
    for (var i = 0; i < this.eles.length; i++) {
        if (dbx.hasClass(this.eles[i], 'dbx\-dummy')) {
            this.container.removeChild(this.eles[i]);
        }
    }
    this.initBoxes(recover, true);
    this.regenerateBoxOrder();
};
dbxGroup.prototype.functionExists = function (cname) {
    return typeof this[cname] == 'function';
};
dbxGroup.prototype.mousedown = function (e, box, handle, override) {
    var node = typeof handle != 'undefined' ? handle : typeof e.target != 'undefined' ? e.target : e.srcElement;
    if (node.nodeName == '#text') {
        node = node.parentNode;
    }
    if (!dbx.hasClass(node, 'dbx\-(toggle|box|group)')) {
        while (!dbx.hasClass(node, 'dbx\-(handle|box|group)')) {
            node = node.parentNode;
        }
    }
    if (dbx.hasClass(node, 'dbx\-(toggle|handle)')) {
        box.className += ' dbx-box-active';
    }
    if (!dbx.hasClass(box, 'dbx\-nograb') && dbx.hasClass(node, 'dbx\-handle')) {
        this.clearDialog();
        box = dbx.removeClass(box, 'dbx\-box\-focus');
        this.removeTooltip();
        this.released = false;
        this.initial = {
            'x': e.clientX,
            'y': e.clientY
        };
        if (typeof override != 'undefined') {
            this.initial.x += (0 - override.x);
            this.initial.y += (0 - override.y);
        }
        this.current = {
            'x': 0,
            'y': 0
        };
        this.createCloneBox(box, 'mouse');
        if (typeof e.preventDefault != 'undefined') {
            e.preventDefault();
        }
        if (typeof document.onselectstart != 'undefined') {
            document.onselectstart = function () {
                return false;
            }
        }
    }
};
dbxGroup.prototype.mousemove = function (e) {
    if (!this.dragok && (this.dialog && this.dialog.source != 'keyboard')) {
        this.clearDialog();
        this.removeTooltip();
        this.removeActiveClasses('dbx\-box\-(target|active)');
    }
    if (this.dragok && this.box) {
        this.direction = e.clientY == this.current.y ? (e.clientX > this.current.x ? 'right' : 'left') : (e.clientY > this.current.y ? 'down' : 'up');
        this.current = {
            'x': e.clientX,
            'y': e.clientY
        };
        var overall = {
            'x': this.current.x - this.initial.x,
            'y': this.current.y - this.initial.y
        };
        if (((overall.x >= 0 && overall.x <= this.threshold) || (overall.x <= 0 && overall.x >= 0 - this.threshold)) && ((overall.y >= 0 && overall.y <= this.threshold) || (overall.y <= 0 && overall.y >= 0 - this.threshold))) {
            this.current.x -= overall.x;
            this.current.y -= overall.y;
        }
        if (this.released || overall.x > this.threshold || overall.x < (0 - this.threshold) || overall.y > this.threshold || overall.y < (0 - this.threshold)) {
            dbx.dbxobject = this;
            dbx.group = this.container;
            dbx.sourcebox = this.box;
            dbx.clonebox = this.boxclone;
            dbx.event = e;
            if (typeof dbx.onboxdrag == 'undefined' || dbx.onboxdrag()) {
                this.released = true;
                if (this.restrict != 'vertical' || this.orientation == 'horizontal') {
                    this.boxclone.style.left = parseInt(this.current.x - this.difference.x, 10) + 'px';
                }
                if (this.restrict != 'horizontal' || this.orientation == 'vertical') {
                    this.boxclone.style.top = parseInt(this.current.y - this.difference.y, 10) + 'px';
                }
                if (this.restrict == 'freeform') {
                    var clonepoint = {
                        'x': this.boxclone.offsetLeft + (this.boxclone.offsetWidth / 2),
                        'y': this.boxclone.offsetTop + (this.boxclone.offsetHeight / 2)
                    };
                    var proportion = 0.2;
                    var hypotonuse = Math.round(Math.sqrt(Math.pow(this.boxclone.offsetWidth, 2) + Math.pow(this.boxclone.offsetHeight, 2)));
                    if (clonepoint.x < 0 || clonepoint.x > (this.container.offsetWidth - proportion * hypotonuse) || clonepoint.y < 0 || clonepoint.y > (this.container.offsetHeight - proportion * hypotonuse)) {
                        this.mouseup(e);
                        return true;
                    }
                }
                this.moveBoxByMouse(this.current.x, this.current.y, this.confirm);
                if (typeof e.preventDefault != 'undefined') {
                    e.preventDefault();
                }
            }
        }
    }
    return true;
};
dbxGroup.prototype.mouseup = function (e) {
    this.removeActiveClasses('dbx\-box\-(target|active)');
    if (this.box) {
        if (this.dialog) {
            if (typeof this.dialog.group != 'undefined' && typeof this.boxes[dbx.getID(this.dialog)] == 'undefined') {
                var xgroup = this.dialog.group;
                var xinsert = xgroup.boxes[dbx.getID(this.dialog)];
            }
            this.clearDialog();
            if (typeof xgroup != 'undefined') {
                dbx.mousemove(e, this, xgroup, xinsert);
                return;
            }
            this.moveBoxByMouse(e.clientX, e.clientY, false);
        }
        this.removeCloneBox();
        this.regenerateBoxOrder();
        if (typeof document.onselectstart != 'undefined') {
            document.onselectstart = function () {
                return true;
            }
        }
    }
    this.clearDialog();
    this.dragok = false;
};
dbxGroup.prototype.click = function (e, anchor) {
    if (anchor.hasfocus === true || anchor.hasfocus === null) {
        if (this.dialog) {
            var box = dbx.getTarget(null, 'dbx\-box', anchor);
            var dbxid = dbx.getID(this.dialog); {
                var targetbox = this.boxes[dbxid];
            }
            if (this.exchange == 'insert' && this.confirm == true && this.positive == true) {
                targetbox = dbx.get('nextSibling', targetbox);
                if (!targetbox) {
                    targetbox = this.boxes[dbxid];
                }
            }
            var confirmed = dbx.hasClass(this.dialog, 'dbx\-dialog\-yes');
            this.clearDialog();
            this.removeTooltip();
            if (typeof targetbox != 'undefined' && targetbox != box && confirmed == true) {
                if (this.exchange == 'swap') {
                    this.swapTwoBoxes(box, targetbox, anchor, true, false);
                } else {
                    return this.insertTwoBoxes(box, targetbox, anchor, true, false);
                }
            }
            return false;
        }
        this.removeTooltip();
        this.toggleBoxState(anchor, true, true, null);
    }
    return false;
};
dbxGroup.prototype.keypress = function (e, anchor) {
    var parentbox = dbx.getTarget(null, 'dbx\-box', anchor);
    if (/^(3[7-9])|(40)$/.test(e.keyCode.toString())) {
        if (dbx.opera && e.shiftKey) {
            return true;
        }
        if (!dbx.hasClass(dbx.getTarget(null, 'dbx\-box', anchor), 'dbx\-nograb')) {
            parentbox.className += ' dbx-box-active';
            this.removeTooltip();
            var direction = '';
            switch (e.keyCode) {
                case 37:
                    direction = 'W';
                    break;
                case 38:
                    direction = 'N';
                    break;
                case 39:
                    direction = 'E';
                    break;
                case 40:
                    direction = 'S';
                    break;
            }
            var wait = 75;
            if (this.currentdir && this.currentdir != direction) {
                direction += this.currentdir.toLowerCase();
                switch (direction) {
                    case 'En':
                        direction = 'Ne';
                        break;
                    case 'Es':
                        direction = 'Se';
                        break;
                    case 'Wn':
                        direction = 'Nw';
                        break;
                    case 'Ws':
                        direction = 'Sw';
                        break;
                }
                clearTimeout(this.keytimer);
                wait = 0;
            } else {
                this.currentdir = direction;
            }
            var self = this;
            this.keytimer = setTimeout(function () {
                if (!/^(Ns|Sn|Ew|Ww)$/.test(direction)) {
                    if (self.dialog) {
                        var dbxid = dbx.getID(self.dialog); {
                            var box = self.boxes[dbxid];
                        }
                    } else {
                        box = dbx.getTarget(null, 'dbx\-box', anchor);
                    }
                    self.moveBoxByKeyboard(e, anchor, box, direction, self.confirm, true);
                }
            }, wait);
            if (typeof e.preventDefault != 'undefined') {
                e.preventDefault();
            } else {
                return false;
            }
            typeof e.stopPropagation != 'undefined' ? e.stopPropagation() : e.cancelBubble = true;
            this.keydown = false;
        }
    } else if (dbx.kde && e.target == anchor && (e.keyCode == 13 || e.keyCode == 32)) {
        this.click(e, anchor);
        e.preventDefault();
    } else {
        this.removeActiveClasses('dbx\-box\-(target|active)');
    }
    if (e.keyCode == 13 || e.keyCode == 32) {
        parentbox.className += ' dbx-box-active';
    }
    return true;
};
dbxGroup.prototype.regenerateBoxOrder = function () {
    this.order = [];
    var len = this.eles.length;
    for (var j = 0; j < len; j++) {
        if (dbx.hasClass(this.eles[j], 'dbx\-box') && !dbx.hasClass(this.eles[j], 'dbx\-(clone|dummy)')) {
            this.order.push(dbx.getID(this.eles[j]) + (dbx.hasClass(this.eles[j], 'dbx\-box\-open') ? '+' : '-'));
        }
    }
    dbx.savedata[this.gid] = this.order.join(',');
    dbx.dbxobject = this;
    dbx.group = this.container;
    dbx.gid = this.gid;
    this.updateChildClasses();
    dbx.setCookieState();
};
dbxGroup.prototype.updateChildClasses = function () {
    var boxids = [],
        eles = dbx.get('*', this.container);
    for (var i = 0; i < eles.length; i++) {
        if (dbx.hasClass(eles[i], 'dbx\-box') && !dbx.hasClass(eles[i], 'dbx\-(dummy|clone)')) {
            boxids.push(dbx.getID(eles[i]));
        }
    }
    var children = {
        'first': boxids[0],
        'last': boxids[boxids.length - 1]
    };
    for (var i in children) {
        if (dbx.unwanted(children, i)) {
            continue;
        }
        var box = this.boxes[children[i]];
        if (this.child[i] != null) {
            this.child[i] = dbx.removeClass(this.child[i], i + '\-child');
            if (this.boxclone && dbx.getID(this.boxclone) == dbx.getID(this.child[i])) {
                this.boxclone = dbx.removeClass(this.boxclone, i + '\-child');
            }
            this.child[i] = null;
        }
        box.className += ' ' + i + '-child';
        this.child[i] = box;
        if (this.boxclone && dbx.getID(this.boxclone) == dbx.getID(this.child[i])) {
            this.boxclone.className += ' ' + i + '-child';
        }
    }
};
dbxGroup.prototype.createClone = function (box, zorder, position, cname, children, source) {
    var clone = this.container.appendChild(box.cloneNode(children));
    clone.source = source;
    clone.className += ' dbx-clone';
    if (cname != '') {
        clone.className += ' ' + cname;
    }
    clone = dbx.removeClass(clone, 'dbx\-box\-focus');
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.zIndex = zorder;
    clone.style.left = parseInt(position.x, 10) + 'px';
    clone.style.top = parseInt(position.y, 10) + 'px';
    clone.style.width = box.offsetWidth + 'px';
    clone.style.height = box.offsetHeight + 'px';
    return clone;
};
dbxGroup.prototype.createCloneBox = function (box, source) {
    this.box = box;
    this.position = {
        'x': this.box.offsetLeft,
        'y': this.box.offsetTop
    };
    this.difference = {
        'x': (this.initial.x - this.position.x),
        'y': (this.initial.y - this.position.y)
    };
    this.boxclone = this.createClone(this.box, 30000, this.position, 'dbx-dragclone', true, source);
    this.boxclone.style.cursor = 'move';
    this.dragok = true;
};
dbxGroup.prototype.removeCloneBox = function () {
    this.container.removeChild(this.boxclone);
    this.box.style.visibility = 'visible';
    this.box = null;
};
dbxGroup.prototype.removeActiveClasses = function (pattern) {
    for (var i in this.boxes) {
        if (dbx.unwanted(this.boxes, i)) {
            continue;
        }
        this.boxes[i] = dbx.removeClass(this.boxes[i], pattern);
    }
};
dbxGroup.prototype.moveBoxByMouse = function (clientX, clientY, confirm) {
    if (this.orientation == 'freeform') {
        var clonepoint = {
            'x': clientX - this.difference.x + (this.boxclone.offsetWidth / 2),
            'y': clientY - this.difference.y + (this.boxclone.offsetHeight / 2)
        };
        var differences = [];
    } else {
        var cloneprops = {
            'xy': this.orientation == 'vertical' ? clientY - this.difference.y : clientX - this.difference.x,
            'wh': this.orientation == 'vertical' ? this.boxclone.offsetHeight : this.boxclone.offsetWidth
        };
    }
    if (dbx.hide) {
        this.box.style.visibility = 'hidden';
    }
    this.removeActiveClasses('dbx\-box\-(target|active)');
    this.boxclone.style.visibility = 'visible';
    for (var i in this.boxes) {
        if (dbx.unwanted(this.boxes, i)) {
            continue;
        }
        if (this.orientation == 'freeform') {
            if (dbx.hasClass(this.boxes[i], 'dbx\-dummy') && this.exhange == 'swap') {
                continue;
            }
            var boxpoint = {
                'x': this.boxes[i].offsetLeft + (this.boxes[i].offsetWidth / 2),
                'y': this.boxes[i].offsetTop + (this.boxes[i].offsetHeight / 2)
            };
            differences.push([i, Math.round(Math.sqrt(Math.pow(Math.abs(clonepoint.x - boxpoint.x), 2) + Math.pow(Math.abs(clonepoint.y - boxpoint.y), 2)))]);
            if (this.boxes[i] == this.box) {
                differences[differences.length - 1][1] = Math.pow(10, 20);
                if (confirm || this.dialog) {
                    this.updateDialog(this.box, '', null, null, 'mouse');
                }
            }
        } else {
            var boxprops = {
                'xy': this.orientation == 'vertical' ? this.boxes[i].offsetTop : this.boxes[i].offsetLeft,
                'wh': this.orientation == 'vertical' ? this.boxes[i].offsetHeight : this.boxes[i].offsetWidth
            };
            this.positive = this.direction == 'down' || this.direction == 'right';
            if ((this.positive && cloneprops.xy + cloneprops.wh > boxprops.xy && cloneprops.xy < boxprops.xy) || (!this.positive && cloneprops.xy < boxprops.xy && cloneprops.xy + cloneprops.wh > boxprops.xy)) {
                if (this.boxes[i] == this.box) {
                    return;
                }
                var sibling = dbx.getSiblingBox(this.box, 'nextSibling');
                if (this.box == sibling || this.boxes[i] == sibling) {
                    return;
                }
                var index = i;
                break;
            }
        }
    }
    if (this.orientation == 'freeform') {
        differences.sort(function (a, b) {
            return a[1] - b[1];
        });
        index = differences[0][0];
        var targetbox = this.boxes[index];
        var originaltargetbox = targetbox;
        if (this.exchange == 'insert' && (this.direction == 'down' || this.direction == 'right')) {
            targetbox = dbx.get('nextSibling', targetbox);
        }
        if (targetbox == this.box) {
            return;
        }
        boxprops = {
            'left': originaltargetbox.offsetLeft,
            'top': originaltargetbox.offsetTop
        };
        boxprops.right = boxprops.left + targetbox.offsetWidth;
        boxprops.bottom = boxprops.top + targetbox.offsetHeight;
        var proportion = confirm || this.dialog ? 0 : 0.1;
        var hypotonuse = Math.round(Math.sqrt(Math.pow(originaltargetbox.offsetWidth, 2) + Math.pow(originaltargetbox.offsetHeight, 2)));
        if (!(clonepoint.x > boxprops.left + (hypotonuse * proportion) && clonepoint.x < boxprops.right - (hypotonuse * proportion) && clonepoint.y > boxprops.top + (hypotonuse * proportion) && clonepoint.y < boxprops.bottom - (hypotonuse * proportion))) {
            return;
        }
        if (this.last.box == targetbox && this.last.direction == this.direction) {
            return;
        }
        var origpoint = {
            'x': this.box.offsetLeft + (this.box.offsetWidth / 2),
            'y': this.box.offsetTop + (this.box.offsetHeight / 2)
        };
        boxpoint = {
            'x': originaltargetbox.offsetLeft + (originaltargetbox.offsetWidth / 2),
            'y': originaltargetbox.offsetTop + (originaltargetbox.offsetHeight / 2)
        };
        var blocks = this.getBlocksDifference(origpoint, boxpoint, this.box);
        var compass = this.getCompassDirection(origpoint, boxpoint);
        if (this.functionExists('_testRules') && !this._testRules(compass, blocks, this.box, null)) {
            if (confirm || this.dialog) {
                this.updateDialog(originaltargetbox, ' dbx-dialog-no', null, null, 'mouse');
            }
            return;
        }
        if (confirm || this.dialog) {
            if (!dbx.hasClass(targetbox, 'dbx\-(dialog|dummy)')) {
                originaltargetbox.className += ' dbx-box-target';
            }
            this.updateDialog(originaltargetbox, ' dbx-dialog-yes', null, null, 'mouse');
            return;
        }
        if (this.functionExists('_updateRulePointer')) {
            this._updateRulePointer();
        }
        this.last = {
            'box': originaltargetbox,
            'direction': this.direction
        };
    } else {
        var targetbox = this.boxes[index];
        var originaltargetbox = targetbox;
    }
    if (typeof index == 'undefined') {
        return;
    }
    if (!dbx.hasClass(originaltargetbox, 'dbx\-(dialog|dummy)')) {
        originaltargetbox.className += ' dbx-box-target';
    }
    if (typeof dbx.onbeforestatechange != 'undefined') {
        var actions = dbx.compileAndDispatchOnBeforeStateChange(['proceed', this, this.container, this.gid, this.box, originaltargetbox, (this.orientation == 'freeform' ? this.exchange : 'move')]);
        if (!actions.proceed) {
            return;
        }
    }
    if (this.orientation == 'freeform') {
        if (this.exchange == 'swap') {
            var visibox = originaltargetbox;
        } else {
            var add = false,
                pointer = 0,
                theboxes = [],
                visiboxes = [];
            for (var i in this.boxes) {
                if (dbx.unwanted(this.boxes, i)) {
                    continue;
                }
                theboxes.push(this.boxes[i]);
            }
            for (i = 0; i < theboxes.length; i++) {
                if (theboxes[i] == this.box) {
                    continue;
                }
                visiboxes.push(theboxes[i]);
            }
        }
    } else {
        if (this.positive) {
            var visibox = dbx.getSiblingBox(targetbox, 'previousSibling');
        } else {
            visibox = targetbox;
        }
    }
    if (typeof visiboxes != 'undefined') {
        var visiposes = [];
        for (i = 0; i < visiboxes.length; i++) {
            visiposes.push({
                'x': visiboxes[i].offsetLeft,
                'y': visiboxes[i].offsetTop
            });
        }
    } else {
        var visipos = {
            'x': visibox.offsetLeft,
            'y': visibox.offsetTop
        };
    }
    originaltargetbox = dbx.removeClass(originaltargetbox, 'dbx\-box\-target');
    var prepos = {
        'x': this.box.offsetLeft,
        'y': this.box.offsetTop
    };
    if (this.orientation == 'freeform' && this.exchange == 'swap') {
        var next = targetbox.nextSibling;
        if (next == this.box) {
            targetbox.parentNode.insertBefore(this.box, targetbox);
        } else {
            this.box.parentNode.insertBefore(targetbox, this.box);
            next.parentNode.insertBefore(this.box, next);
        }
    } else {
        this.container.insertBefore(this.box, targetbox);
    }
    this.updateChildClasses();
    this.initial.x += (this.box.offsetLeft - prepos.x);
    this.initial.y += (this.box.offsetTop - prepos.y);
    if (typeof visiboxes != 'undefined' && visiboxes.length > 0) {
        for (i = 0; i < visiboxes.length; i++) {
            new dbxAnimator(this, visiboxes[i], visiposes[i], this.resolution, false, null, true);
        }
    } else if (visibox != this.box) {
        new dbxAnimator(this, visibox, visipos, this.resolution, false, null, true);
    }
    if (!this.confirm && !dbx.hide) {
        new dbxAnimator(this, this.box, prepos, this.resolution, false, null, true);
    }
};
dbxGroup.prototype.getCompassDirection = function (a, b) {
    var compass = a.y < b.y ? 'S' : 'N';
    if (a.y == b.y) {
        compass = a.x < b.x ? 'E' : 'W';
    } else if (a.x < b.x) {
        compass += 'e';
    } else if (a.x > b.x) {
        compass += 'w';
    }
    return compass;
};
dbxGroup.prototype.getBlocksDifference = function (a, b, box) {
    var blocks = [parseInt(Math.abs(a.x - b.x) / box.offsetWidth, 10), parseInt(Math.abs(a.y - b.y) / box.offsetHeight, 10)];
    blocks.sort(function (a, b) {
        return a - b;
    });
    return blocks;
};
dbxGroup.prototype.updateDialog = function (box, state, position, group, source) {
    if (this.buffer) {
        clearTimeout(this.buffer);
        this.buffer = null;
    }
    var self = this;
    this.buffer = setTimeout(function () {
        var boxpos = {
            'x': box.offsetLeft,
            'y': box.offsetTop
        };
        if (position) {
            boxpos.x += position.x;
            boxpos.y += position.y;
        }
        self.clearDialog();
        self.dialog = self.createClone(box, 29999, boxpos, 'dbx-dialog' + state, false, source);
        self.dialog = dbx.removeClass(self.dialog, 'dbx\-box\-(target|active|hover|focus)');
        self.dialog.style.visibility = 'visible';
        clearTimeout(self.buffer);
        self.buffer = null;
    }, 20);
};
dbxGroup.prototype.clearDialog = function () {
    if (this.dialog) {
        this.container.removeChild(this.dialog);
        this.dialog = null;
    }
};
dbxGroup.prototype.contains = function (outer, inner) {
    if (inner == outer) {
        return true;
    }
    if (inner == null) {
        return false;
    } else {
        return this.contains(outer, inner.parentNode);
    }
};
dbxGroup.prototype.refocus = function (target) {
    try {
        target.focus();
    } catch (err) { }
    var box = dbx.getTarget(null, 'dbx\-box', target);
    if (!dbx.hasClass(box, 'dbx-box-focus')) {
        box.className += ' dbx-box-focus';
    }
};

function dbxAnimator(caller, box, pos, res, kbd, anchor, manual) {
    this.caller = caller;
    if (this.caller.resolution == 0) {
        this.caller.resolution = 1;
    }
    this.box = box;
    this.timer = null;
    var before = {
        'x': pos.x,
        'y': pos.y
    };
    var after = {
        'x': this.box.offsetLeft,
        'y': this.box.offsetTop
    };
    if (!(before.x == after.x && before.y == after.y)) {
        if (dbx.running > this.caller.boxes.length - 1) {
            return;
        }
        var clone = this.caller.createClone(this.box, 29999, arguments[2], 'dbx-aniclone', true, 'animator');
        clone.style.visibility = 'visible';
        this.box.style.visibility = 'hidden';
        var change = {
            'x': after.x > before.x ? after.x - before.x : 0 - (before.x - after.x),
            'y': after.y > before.y ? after.y - before.y : 0 - (before.y - after.y)
        };
        this.animateClone(clone, before, change, res, kbd, anchor, manual);
    }
};
dbxAnimator.prototype.animateClone = function (clone, current, change, res, kbd, anchor, manual) {
    var self = this;
    var count = 0;
    dbx.running++;
    this.timer = window.setInterval(function () {
        count++;
        current.x += change.x / res;
        current.y += change.y / res;
        clone.style.left = parseInt(current.x, 10) + 'px';
        clone.style.top = parseInt(current.y, 10) + 'px';
        if (count == res) {
            window.clearInterval(self.timer);
            self.timer = null;
            dbx.running--;
            self.caller.container.removeChild(clone);
            self.box.style.visibility = 'visible';
            if (self.box.className.indexOf('dbxid') != -1) {
                self.box = dbx.removeClass(self.box, 'dbx\-dummy');
            }
            self.caller.boxes[dbx.getID(self.box)] = self.box;
            if (kbd && manual) {
                if (anchor && anchor.parentNode.style.visibility != 'hidden') {
                    setTimeout(function () {
                        self.caller.refocus(anchor);
                    }, 0);
                } else if (self.caller.toggles) {
                    var button = self.caller.buttons[dbx.getID(self.box)];
                    if (button && typeof button.isactive != 'undefined') {
                        self.caller.refocus(button);
                    }
                } else {
                    if (typeof self.box.focus == 'function') {
                        setTimeout(function () {
                            self.caller.refocus(self.box);
                        }, 0);
                    }
                }
            }
            if (typeof dbx.onafteranimate == 'function') {
                setTimeout(function () {
                    dbx.compileAndDispatchOnAfterAnimate(self.box, self.caller)
                }, 0);
            }
        }
        if (typeof dbx.onanimate == 'function' && self.caller.resolution > 1) {
            dbx.compileAndDispatchOnAnimate(self.box, clone, self.caller, count, res)
        }
    }, 20);
};
if (typeof window.attachEvent != 'undefined') {
    window.attachEvent('onunload', function () {
        var ev = ['mousedown', 'mousemove', 'mouseup', 'mouseout', 'click', 'keydown', 'keyup', 'focus', 'blur', 'selectstart', 'statechange', 'boxdrag', 'boxopen', 'boxclose', 'ruletest', 'afteranimate', 'beforestatechange'];
        var el = ev.length;
        var dl = document.all.length;
        for (var i = 0; i < dl; i++) {
            for (var j = 0; j < el; j++) {
                document.all[i]['on' + ev[j]] = null;
            }
        }
    });
}