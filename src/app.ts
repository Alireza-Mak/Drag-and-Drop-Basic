// Autobind Decorator
function Autobind(_: any, _2: string | number, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// Validation
interface validateType {
  value: string | number;
  required?: true | false;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
function validate(validatableInput: validateType) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value == 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value == 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof +validatableInput.value == 'number'
  ) {
    isValid = isValid && +validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof +validatableInput.value == 'number'
  ) {
    isValid = isValid && +validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// Drag and Drop Interface
interface Draggable {
  dragStartHandler: (event: DragEvent | TouchEvent) => void;
  TouchMoveHandler: (event: TouchEvent) => void;
  dragEndHandler: (event: DragEvent) => void;
}
interface DragTarget {
  dragOverHandler: (event: DragEvent) => void;
  dropHandler: (event: DragEvent | TouchEvent) => void;
  dragLeaveHandler: (event: DragEvent) => void;
}

// Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    private templateId: string,
    private hostElementId: string,
    private insertAtStart: boolean,
    private newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      this.templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(this.hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (this.newElementId) this.element.id = this.newElementId;

    this.attach();
  }
  abstract configure(): void;
  abstract renderContent(): void;
  private attach() {
    this.hostElement.insertAdjacentElement(
      this.insertAtStart ? 'afterbegin' : 'beforeend',
      this.element
    );
  }
}

// Project Class
enum ProjectStatus {
  ACTIVE,
  FINISHIED,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// State Component  Class
class StateComponent<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Project State Class
type Listener<T> = (projects: T[]) => void;

class ProjectState extends StateComponent<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }
  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }
  addProject(title: string, description: string, people: number) {
    const id = Math.random().toString();
    const project = new Project(
      id,
      title,
      description,
      people,
      ProjectStatus.ACTIVE
    );
    this.projects.push(project);
    this.updatedListeners();
  }

  moveProject(prjId: string, prjstatus: ProjectStatus) {
    const prj = this.projects.find((prj) => prj.id === prjId);
    if (prj && prj.status !== prjstatus) {
      prj.status = prjstatus;
      this.updatedListeners();
    }
  }
  deleteProject(prjId: string) {
    this.projects = this.projects.filter((project) => project.id !== prjId);
    this.updatedListeners();
  }

  private updatedListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

// Project Item Class
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  static selectedItem: HTMLLIElement | null;
  static status: string;
  constructor(hostId: string, project: Project) {
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
  @Autobind
  dragStartHandler(event: DragEvent | TouchEvent): void {
    if (event instanceof DragEvent) {
      event.dataTransfer!.setData('text/plain', this.project.id);
      event.dataTransfer!.effectAllowed = 'move';
    }
    if (event instanceof TouchEvent) {
      const element = event.target as HTMLElement;
      if (element.tagName === 'BUTTON') {
      } else if (element.tagName !== 'LI') {
        const ul = element.parentElement!.parentElement!.id.split('-')[0];
        ProjectItem.status = ul;
        ProjectItem.selectedItem = element.parentElement as HTMLLIElement;
      } else {
        const ul = element.parentElement!.id.split('-')[0];
        ProjectItem.status = ul;
        ProjectItem.selectedItem = element as HTMLLIElement;
      }
      if (ProjectItem.selectedItem) {
        ProjectItem.selectedItem.style.height =
          ProjectItem.selectedItem.clientHeight.toString();
        ProjectItem.selectedItem.style.width =
          ProjectItem.selectedItem.clientWidth.toString();
        ProjectItem.selectedItem.style.position = 'fixed';
        ProjectItem.selectedItem.style.zIndex = '-10';
      }
    }
  }

  TouchMoveHandler = (event: TouchEvent) => {
    event.preventDefault(); // Prevent default touchmove behavior
    if (ProjectItem.selectedItem) {
      const touch = event.touches[0];

      // Update the xPos and yPos with the touch position
      const xPos = touch.clientX;
      const yPos = touch.clientY;

      // Update the position of the element
      ProjectItem.selectedItem.style.left = xPos + 'px';
      ProjectItem.selectedItem.style.top = yPos + 'px';

      const activeProjectsList = document.getElementById(
        'active-projects-list'
      );
      const finishedProjectsList = document.getElementById(
        'finished-projects-list'
      );

      activeProjectsList!.classList.remove('droppable');
      finishedProjectsList!.classList.remove('droppable');

      // Find the target element based on the touch position
      const target = document.elementFromPoint(xPos, yPos);

      // Check if the target lists are the active projects list and finished projects list
      const isTargetActive = activeProjectsList!.contains(target);
      const isTargetFinished = finishedProjectsList!.contains(target);

      // Change the style of the target lists
      if (isTargetActive) {
        activeProjectsList!.classList.add('droppable');
      } else if (isTargetFinished) {
        finishedProjectsList!.classList.add('droppable');
      }
    }
  };

  dragEndHandler(_: DragEvent): void {}

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('touchstart', this.dragStartHandler);
    this.element.addEventListener('touchmove', this.TouchMoveHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
    this.element
      .querySelector('button')!
      .addEventListener('click', this.deleteItem);
  }
  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.person;
    this.element.querySelector('button')!.textContent = 'Delete';
    this.element.querySelector('button')!.id = this.project.id;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
  @Autobind
  deleteItem(): void {
    projectState.deleteProject(this.project.id);
  }
}

// Project Input Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;
    this.configure();
  }
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }
  renderContent(): void {}
  private gatherUserInput(): [string, string, number] | void {
    const enteredTiltle = this.titleInputElement.value.trim();
    const enteredDescription = this.descriptionInputElement.value.trim();
    const enteredProple = this.peopleInputElement.value.trim();
    const titleValidate: validateType = {
      value: enteredTiltle,
      required: true,
      minLength: 4,
      maxLength: 40,
    };
    const descriptionValidate: validateType = {
      value: enteredDescription,
      required: true,
      minLength: 4,
      maxLength: 40,
    };
    const peopleValidate: validateType = {
      value: enteredProple,
      required: true,
      min: 0,
      max: 5,
    };
    if (
      !validate(titleValidate) ||
      !validate(descriptionValidate) ||
      !validate(peopleValidate)
    ) {
      alert('Invalid input, please try again!');
    } else {
      return [enteredTiltle, enteredDescription, +enteredProple];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
      this.clearInputs();
    }
  }
}

// Project List Class
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignProjects: Project[];
  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignProjects = [];

    this.configure();
    this.renderContent();
  }
  @Autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const ulElement = this.element.querySelector('ul')! as HTMLUListElement;
      ulElement.classList.add('droppable');
    }
  }
  @Autobind
  dropHandler(event: DragEvent | TouchEvent): void {
    if (event instanceof DragEvent) {
      const prjId = event.dataTransfer!.getData('text/plain');
      projectState.moveProject(
        prjId,
        this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHIED
      );
    }
    if (event instanceof TouchEvent) {
      if (ProjectItem.selectedItem) {
        var ulElements = document.querySelectorAll('ul');
        ulElements.forEach(function (ul) {
          ul.classList.remove('droppable');
        });
        var targetList = document.elementFromPoint(
          event.changedTouches[0].clientX,
          event.changedTouches[0].clientY
        ) as HTMLElement;
        // Check if the target is a <ul> element
        if (targetList && targetList.tagName === 'UL') {
          targetList.appendChild(ProjectItem.selectedItem); // Move the selected <li> element to the target <ul>
          const prjId = ProjectItem.selectedItem.id;
          const status =
            ProjectItem.status === 'active'
              ? ProjectStatus.FINISHIED
              : ProjectStatus.ACTIVE;
          projectState.moveProject(prjId, status);
        }
        // Check if the target is a <li> element
        if (targetList && targetList.tagName === 'LI') {
          targetList.parentElement!.insertBefore(
            ProjectItem.selectedItem,
            targetList.nextSibling
          );
          const prjId = ProjectItem.selectedItem.id;
          const status =
            ProjectItem.status === 'active'
              ? ProjectStatus.FINISHIED
              : ProjectStatus.ACTIVE;
          projectState.moveProject(prjId, status);
        }
        // Reset the position of the selected <li> element
        ProjectItem.selectedItem.style.left = '';
        ProjectItem.selectedItem.style.top = '';
        ProjectItem.selectedItem.style.height = '';
        ProjectItem.selectedItem.style.width = '';
        ProjectItem.selectedItem.style.position = '';
        ProjectItem.selectedItem.style.zIndex = '';
      }
    }
  }

  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    const ulElement = this.element.querySelector('ul')! as HTMLUListElement;
    ulElement.classList.remove('droppable');
  }
  configure(): void {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('touchend', this.dropHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj: Project) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.ACTIVE;
        } else {
          return prj.status === ProjectStatus.FINISHIED;
        }
      });
      this.assignProjects = relevantProjects;
      this.renderProjects();
    });
  }
  renderContent(): void {
    const listid = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listid;
    this.element.querySelector('h2')!.textContent =
      `${this.type} projects`.toUpperCase();
  }
  private renderProjects() {
    const ulElement = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    ulElement.innerHTML = '';
    for (const project of this.assignProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, project);
    }
  }
}

// Instantiation
const projectState = ProjectState.getInstance();
const prjInput = new ProjectInput();
const activePrj = new ProjectList('active');
const finishPrj = new ProjectList('finished');
