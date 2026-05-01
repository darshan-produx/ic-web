import {
  sumReducer,
  getMaximum,
  getMinimum,
  roundValue,
  validateArguments,
} from './treeMap-helper';

interface DataPoint {
  value: number;
}

export function getTreemap({
  data,
  width,
  height,
}: {
  data: { value: number }[];
  width: number;
  height: number;
}) {
  function worstRatio(row: any[], width: number) {
    const sum = row.reduce(sumReducer, 0);
    const rowMax = getMaximum(row);
    const rowMin = getMinimum(row);
    return Math.max(
      (width ** 2 * rowMax) / sum ** 2,
      sum ** 2 / (width ** 2 * rowMin)
    );
  }

  const getMinWidth = () => {
    if (Rectangle.totalHeight ** 2 > Rectangle.totalWidth ** 2) {
      return { value: Rectangle.totalWidth, vertical: false };
    }
    return { value: Rectangle.totalHeight, vertical: true };
  };

  const layoutRow = (row: any[], width: number, vertical: boolean) => {
    const rowHeight = row.reduce(sumReducer, 0) / width;

    row.forEach((rowItem) => {
      const rowWidth = rowItem / rowHeight;
      const { xBeginning } = Rectangle;
      const { yBeginning } = Rectangle;

      let data: any;
      if (vertical) {
        data = {
          x: xBeginning,
          y: yBeginning,
          width: rowHeight,
          height: rowWidth,
          data: initialData[Rectangle.data.length],
        };
        Rectangle.yBeginning += rowWidth;
      } else {
        data = {
          x: xBeginning,
          y: yBeginning,
          width: rowWidth,
          height: rowHeight,
          data: initialData[Rectangle.data.length],
        };
        Rectangle.xBeginning += rowWidth;
      }

      Rectangle.data.push(data);
    });

    if (vertical) {
      Rectangle.xBeginning += rowHeight;
      Rectangle.yBeginning -= width;
      Rectangle.totalWidth -= rowHeight;
    } else {
      Rectangle.xBeginning -= width;
      Rectangle.yBeginning += rowHeight;
      Rectangle.totalHeight -= rowHeight;
    }
  };

  const layoutLastRow = (rows: any[], children: any[], width: number) => {
    const { vertical } = getMinWidth();
    layoutRow(rows, width, vertical);
    layoutRow(children, width, vertical);
  };

  const squarify: any = (children: number[], row: any[], width: number) => {
    if (children.length === 1) {
      return layoutLastRow(row, children, width);
    }

    const rowWithChild = [...row, children[0]];

    if (
      row.length === 0 ||
      worstRatio(row, width) >= worstRatio(rowWithChild, width)
    ) {
      children.shift();
      return squarify(children, rowWithChild, width);
    }
    layoutRow(row, width, getMinWidth().vertical);
    return squarify(children, [], getMinWidth().value);
  };

  validateArguments({ data, width, height });

  let Rectangle: {
    data: any[];
    xBeginning: number;
    yBeginning: number;
    totalWidth: number;
    totalHeight: number;
  } = {
    data: [],
    xBeginning: 0,
    yBeginning: 0,
    totalWidth: width,
    totalHeight: height,
  };
  let initialData = data;
  const totalValue = data
    .map((dataPoint) => dataPoint.value)
    .reduce(sumReducer, 0);
  const dataScaled = data.map(
    (dataPoint) => (dataPoint.value * height * width) / totalValue
  );

  squarify(dataScaled, [], getMinWidth().value);
  return Rectangle.data.map((dataPoint) => ({
    ...dataPoint,
    x: roundValue(dataPoint.x),
    y: roundValue(dataPoint.y),
    width: roundValue(dataPoint.width),
    height: roundValue(dataPoint.height),
  }));
}
