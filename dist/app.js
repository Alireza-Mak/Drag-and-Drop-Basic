"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().length !== 0;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value == 'string') {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value == 'string') {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null &&
        typeof +validatableInput.value == 'number') {
        isValid = isValid && +validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null &&
        typeof +validatableInput.value == 'number') {
        isValid = isValid && +validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateId = templateId;
        this.hostElementId = hostElementId;
        this.insertAtStart = insertAtStart;
        this.newElementId = newElementId;
        this.templateElement = document.getElementById(this.templateId);
        this.hostElement = document.getElementById(this.hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (this.newElementId)
            this.element.id = this.newElementId;
        this.attach();
    }
    attach() {
        this.hostElement.insertAdjacentElement(this.insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }
}
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
    ProjectStatus[ProjectStatus["FINISHIED"] = 1] = "FINISHIED";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class StateComponent {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends StateComponent {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new ProjectState();
            return this.instance;
        }
    }
    addProject(title, description, people) {
        const id = Math.random().toString();
        const project = new Project(id, title, description, people, ProjectStatus.ACTIVE);
        this.projects.push(project);
        this.updatedListeners();
    }
    moveProject(prjId, prjstatus) {
        const prj = this.projects.find((prj) => prj.id === prjId);
        if (prj && prj.status !== prjstatus) {
            prj.status = prjstatus;
            this.updatedListeners();
        }
    }
    deleteProject(prjId) {
        this.projects = this.projects.filter((project) => project.id !== prjId);
        this.updatedListeners();
    }
    updatedListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
class ProjectItem extends Component {
    constructor(hostId, project) {
        super('single-project', hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get person() {
        if (this.project.people === 1) {
            return `${this.project.people.toString()} person assigned.`;
        }
        return `${this.project.people.toString()} people assigned.`;
    }
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(_) { }
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
        this.element
            .querySelector('button')
            .addEventListener('click', this.deleteItem);
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = this.person;
        this.element.querySelector('button').textContent = 'Delete';
        this.element.querySelector('button').id = this.project.id;
        this.element.querySelector('p').textContent = this.project.description;
    }
    deleteItem() {
        projectState.deleteProject(this.project.id);
    }
}
__decorate([
    Autobind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    Autobind
], ProjectItem.prototype, "deleteItem", null);
class ProjectInput extends Component {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    renderContent() { }
    gatherUserInput() {
        const enteredTiltle = this.titleInputElement.value.trim();
        const enteredDescription = this.descriptionInputElement.value.trim();
        const enteredProple = this.peopleInputElement.value.trim();
        const titleValidate = {
            value: enteredTiltle,
            required: true,
            minLength: 4,
            maxLength: 40,
        };
        const descriptionValidate = {
            value: enteredDescription,
            required: true,
            minLength: 4,
            maxLength: 40,
        };
        const peopleValidate = {
            value: enteredProple,
            required: true,
            min: 0,
            max: 5,
        };
        if (!validate(titleValidate) ||
            !validate(descriptionValidate) ||
            !validate(peopleValidate)) {
            alert('Invalid input, please try again!');
        }
        else {
            return [enteredTiltle, enteredDescription, +enteredProple];
        }
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
class ProjectList extends Component {
    constructor(type) {
        super('project-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const ulElement = this.element.querySelector('ul');
            ulElement.classList.add('droppable');
        }
    }
    dropHandler(event) {
        const prjId = event.dataTransfer.getData('text/plain');
        projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHIED);
    }
    dragLeaveHandler(_) {
        const ulElement = this.element.querySelector('ul');
        ulElement.classList.remove('droppable');
    }
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((prj) => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.ACTIVE;
                }
                else {
                    return prj.status === ProjectStatus.FINISHIED;
                }
            });
            this.assignProjects = relevantProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listid = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listid;
        this.element.querySelector('h2').textContent =
            `${this.type} projects`.toUpperCase();
    }
    renderProjects() {
        const ulElement = document.getElementById(`${this.type}-projects-list`);
        ulElement.innerHTML = '';
        for (const project of this.assignProjects) {
            new ProjectItem(this.element.querySelector('ul').id, project);
        }
    }
}
__decorate([
    Autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dragLeaveHandler", null);
const projectState = ProjectState.getInstance();
const prjInput = new ProjectInput();
const activePrj = new ProjectList('active');
const finishPrj = new ProjectList('finished');
//# sourceMappingURL=app.js.map