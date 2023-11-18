import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sql-query-app';

  sqlQuery: string = '';
  parameterLines: string = '';
  sortedParemeterLinesStr: string = '';
  filledSqlQuery: string = '';
  sortedParameterLines: string[] = [];

  getIndex = (logEntry: string) => {
    const match = logEntry.match(/\[(\d+)\]/);
    return match ? parseInt(match[1]) : -1;
  };

  convertDate = (inputDateStr: string) => {
    const months: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    
    const parts: string[] = inputDateStr.split(' ');
    const year: number = parseInt(parts[parts.length - 1], 10);
    const month: number = months[parts[1]];
    const day: string = parts[2];
    
    const formattedDate: string = new Date(year, month, parseInt(day, 10)).toISOString().split('T')[0];
    return formattedDate;
  }

  displaySortOrder = (parameter: string) => {
    const match = parameter.match(/bindNamedParameters\(\) (.+)$/);
    return match ? `-- ${match[1]}` : '';
  }

  replaceQuestionMarks = (query: string, parameters: string[]) => {
    let index = 0;
    const integerParams = ['startRowNum', 'maxRowNum']
    const dateParams = ['TRXDATE']

    return query.replace(/\?/g, () => {
      const replacement = parameters[index].match(/bindNamedParameters\(\) (.+?) ->/);
      const paramName = parameters[index].match(/->\s*(.*?)\s*\[/)

      if(integerParams.includes(paramName![1])) {
        index++;
        return replacement ? replacement[1] : '?';
      } else if(dateParams.includes(paramName![1])) {
        replacement![1] = this.convertDate(replacement![1]);
        console.log(paramName![1])
      }
      index++;
      return replacement ? `'${replacement[1]}'` : '?';
    });
  };

  fillSqlQuery() {
    let paramsArr: string[] = [];
    this.sortedParemeterLinesStr = '';
    this.filledSqlQuery = '';

    paramsArr = this.parameterLines.trim().split("\n");
    this.sortedParameterLines = paramsArr.sort((a, b) =>this. getIndex(a) - this.getIndex(b));

    const paramAbbrvArr = this.sortedParameterLines.map(this.displaySortOrder);
    this.sortedParemeterLinesStr = paramAbbrvArr.join("\n").toString();
    this.filledSqlQuery = this.replaceQuestionMarks(this.sqlQuery, this.sortedParameterLines);

  }
}
