import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CV_DATA } from './cv-data';

interface TerminalLine {
  type: 'command' | 'output' | 'typing';
  content: string;
  prefix?: string;
}

@Component({
  selector: 'app-cv-terminal',
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-terminal.html',
  styleUrl: './cv-terminal.scss',
})
export class CvTerminal implements OnInit, AfterViewInit {
  @ViewChild('terminalInput') terminalInput?: ElementRef<HTMLInputElement>;
  @ViewChild('terminalContent') terminalContent?: ElementRef<HTMLDivElement>;

  lines: TerminalLine[] = [];
  currentCommand = '';
  commandHistory: string[] = [];
  historyIndex = -1;
  isTyping = false;
  prompt = 'guest@cv-terminal:~$';

  private commands: { [key: string]: () => string } = {
    'help': () => this.helpCommand(),
    'about': () => this.aboutCommand(),
    'experiences': () => this.experiencesCommand(),
    'skills': () => this.skillsCommand(),
    'projects': () => this.projectsCommand(),
    'education': () => this.educationCommand(),
    'contact': () => this.contactCommand(),
    'clear': () => this.clearCommand(),
    'download': () => this.downloadCommand(),
    'sudo rm -rf /': () => this.sudoRmCommand(),
    'matrix': () => this.matrixCommand(),
  };

  ngOnInit(): void {
    this.displayWelcomeAnimation();
  }

  ngAfterViewInit(): void {
    this.focusInput();
  }

  async displayWelcomeAnimation(): Promise<void> {
    this.isTyping = true;
    const welcomeText = `Welcome to Sébastien HEUZE's CV Terminal
Type 'help' for available commands

`;

    await this.typeText(welcomeText);

    this.isTyping = false;
    this.focusInput();
  }

  private async typeText(text: string): Promise<void> {
    for (let i = 0; i < text.length; i++) {
      await this.delay(30);
      const currentText = text.substring(0, i + 1);
      const lastLine = this.lines[this.lines.length - 1];

      if (lastLine && lastLine.type === 'typing') {
        lastLine.content = currentText;
      } else {
        this.lines.push({ type: 'typing', content: currentText });
      }

      this.scrollToBottom();
    }

    // Convert typing to output
    const lastLine = this.lines[this.lines.length - 1];
    if (lastLine && lastLine.type === 'typing') {
      lastLine.type = 'output';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.isTyping) {
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.executeCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(1);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.autocomplete();
    }
  }

  executeCommand(): void {
    const cmd = this.currentCommand.trim();

    if (cmd) {
      // Add to history
      this.commandHistory.push(cmd);
      this.historyIndex = this.commandHistory.length;

      // Display command
      this.lines.push({ type: 'command', content: cmd, prefix: this.prompt });

      // Execute command
      const output = this.processCommand(cmd);
      if (output) {
        this.lines.push({ type: 'output', content: output });
      }
    }

    this.currentCommand = '';
    this.scrollToBottom();
  }

  processCommand(cmd: string): string {
    const normalizedCmd = cmd.toLowerCase().trim();

    // Check for cowsay
    if (normalizedCmd.startsWith('cowsay ')) {
      const message = cmd.substring(7);
      return this.cowsayCommand(message);
    }

    // Check if command exists
    if (this.commands[normalizedCmd]) {
      return this.commands[normalizedCmd]();
    }

    return `Command not found: ${cmd}. Type 'help' for available commands.`;
  }

  navigateHistory(direction: number): void {
    const newIndex = this.historyIndex + direction;

    if (newIndex >= 0 && newIndex < this.commandHistory.length) {
      this.historyIndex = newIndex;
      this.currentCommand = this.commandHistory[this.historyIndex];
    } else if (newIndex === this.commandHistory.length) {
      this.historyIndex = newIndex;
      this.currentCommand = '';
    }
  }

  autocomplete(): void {
    const availableCommands = Object.keys(this.commands);
    const matches = availableCommands.filter(cmd =>
      cmd.startsWith(this.currentCommand.toLowerCase())
    );

    if (matches.length === 1) {
      this.currentCommand = matches[0];
    }
  }

  focusInput(): void {
    setTimeout(() => {
      this.terminalInput?.nativeElement.focus();
    }, 100);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.terminalContent) {
        this.terminalContent.nativeElement.scrollTop =
          this.terminalContent.nativeElement.scrollHeight;
      }
    }, 50);
  }

  // Command implementations
  helpCommand(): string {
    return `Available commands:
  help        - Show this help message
  about       - Display personal information
  experiences - List professional experiences
  skills      - Show technical skills
  projects    - Display side projects
  education   - Show educational background
  contact     - Display contact information
  clear       - Clear the terminal
  download    - Download CV as PDF
  cowsay <msg>- Make the cow say something

Hidden commands: Try 'sudo rm -rf /' or 'matrix'`;
  }

  aboutCommand(): string {
    const data = CV_DATA.about;
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ${data.name}
  ${data.title}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email:     ${data.email}
📱 Phone:     ${data.phone}
🔗 LinkedIn:  ${data.linkedin}
🌍 Languages: ${data.languages.join(', ')}

📝 Profile:
${data.profile}
`;
  }

  experiencesCommand(): string {
    let output = '\n📁 PROFESSIONAL EXPERIENCES\n\n';

    CV_DATA.experiences.forEach((exp, index) => {
      output += `${index + 1}. ${exp.role} @ ${exp.company}\n`;
      output += `   Period: ${exp.period}\n`;
      exp.tasks.forEach(task => {
        output += `   • ${task}\n`;
      });
      output += '\n';
    });

    return output;
  }

  skillsCommand(): string {
    const skills = CV_DATA.skills;
    return `
🛠️  TECHNICAL SKILLS

Languages & Frameworks:
  ${skills.languages.join(', ')}

Cloud & Infrastructure:
  ${skills.cloud.join(', ')}

Authentication:
  ${skills.auth.join(', ')}

Data & Messaging:
  ${skills.data.join(', ')}

CI/CD:
  ${skills.cicd.join(', ')}

Observability & Quality:
  ${skills.observability.join(', ')}
`;
  }

  projectsCommand(): string {
    let output = '\n🚀 SIDE PROJECTS\n\n';

    CV_DATA.projects.forEach((project, index) => {
      output += `${index + 1}. ${project.name}\n`;
      output += `   ${project.description}\n\n`;
    });

    return output;
  }

  educationCommand(): string {
    let output = '\n🎓 EDUCATION\n\n';

    CV_DATA.education.forEach(edu => {
      output += `${edu.year} - ${edu.degree}\n`;
      output += `         ${edu.school}\n\n`;
    });

    return output;
  }

  contactCommand(): string {
    const data = CV_DATA.about;
    return `
📬 CONTACT INFORMATION

Name:     ${data.name}
Email:    ${data.email}
Phone:    ${data.phone}
LinkedIn: ${data.linkedin}

Feel free to reach out!
`;
  }

  clearCommand(): string {
    this.lines = [];
    return '';
  }

  downloadCommand(): string {
    const link = document.createElement('a');
    link.href = 'CV_Sébastien_HEUZE.pdf';
    link.download = 'CV_Sébastien_HEUZE.pdf';
    link.click();

    return `📥 Downloading CV...
File: CV_Sébastien_HEUZE.pdf
Status: Download started successfully!`;
  }

  sudoRmCommand(): string {
    return `
⚠️  WARNING: This will delete everything!
Just kidding... this is a safe environment 😄

[████████████████████████████████] 100%

Error: Permission denied (thank goodness!)
Your system is safe. But maybe don't try this on a real terminal...
`;
  }

  matrixCommand(): string {
    return `
Wake up, Neo...
The Matrix has you...
Follow the white rabbit.

01001000 01100101 01101100 01101100 01101111
01010111 01101111 01110010 01101100 01100100

(Matrix mode not available in this terminal... yet!)
`;
  }

  cowsayCommand(message: string): string {
    const msgLength = message.length;
    const border = '─'.repeat(msgLength + 2);

    return `
 ${border}
< ${message} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`;
  }
}
