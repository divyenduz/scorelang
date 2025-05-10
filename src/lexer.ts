import { type Token } from "./token";

export class Lexer {
  private position = 0;
  private readPosition = 0;
  private ch = "";

  constructor(private program: string) {
    this.readChar();
  }

  nextToken(): Token | null {
    let token: Token | null = null;
    this.skipWhitespace();
    switch (this.ch) {
      case "-":
        token = { type: "SCORE_SEPARATOR", value: this.ch };
        break;
      case ";":
        token = { type: "GAME_SEPARATOR", value: this.ch };
        break;
      case "":
        token = { type: "EOF", value: this.ch };
        break;
      default:
        if (this.isLetter(this.ch)) {
          const identifier = this.readIdentifier();
          token = { type: "TEAM_NAME", value: identifier };
          this.position -= 1;
          this.readPosition -= 1;
        } else if (this.isDigit(this.ch)) {
          const number = this.readNumber();
          token = { type: "TEAM_SCORE", value: number };
          this.position -= 1;
          this.readPosition -= 1;
        } else {
          console.log(`Expected letter or digit, got ${this.ch}`);
          token = { type: "ILLEGAL", value: this.ch };
        }
    }
    this.readChar();
    return token;
  }

  readChar(): void {
    if (this.readPosition >= this.program.length) {
      this.ch = "";
    } else {
      this.ch = this.program[this.readPosition]!;
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  private readIdentifier(): string {
    const startPosition = this.position;
    while (this.isLetter(this.ch) || (this.ch === " " && this.isLetter(this.peekChar()))) {
      this.readChar();
    }
    return this.program.slice(startPosition, this.position);
  }

  private peekChar(): string {
    if (this.readPosition >= this.program.length) {
      return "";
    } else {
      return this.program[this.readPosition]!;
    }
  }

  private readNumber(): string {
    const startPosition = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.program.slice(startPosition, this.position);
  }

  private isLetter(ch: string): boolean {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
  }

  private isDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9";
  }

  private skipWhitespace(): void {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }
}

export default Lexer;
