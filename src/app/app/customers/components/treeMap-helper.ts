export const getMaximum = (array: any[]) => Math.max(...array);

export const getMinimum = (array: any[]) => Math.min(...array);

export const sumReducer = (acc: number, cur: number) => acc + cur;

export const roundValue = (number: number) =>
  Math.max(Math.round(number * 100) / 100, 0);

export const validateArguments = ({
  data,
  width,
  height,
}: {
  data: any[];
  width: number;
  height: number;
}) => {
  if (!width || typeof width !== 'number' || width < 0) {
    throw new Error('You need to specify the width of your treemap');
  }
  if (!height || typeof height !== 'number' || height < 0) {
    throw new Error('You need to specify the height of your treemap');
  }
  if (
    !data ||
    !Array.isArray(data) ||
    data.length === 0 ||
    !data.every(
      (dataPoint) =>
        Object.prototype.hasOwnProperty.call(dataPoint, 'value') &&
        typeof dataPoint.value === 'number' &&
        dataPoint.value >= 0 &&
        !Number.isNaN(dataPoint.value)
    )
  ) {
    throw new Error(
      "You data must be in this format [{ value: 1 }, { value: 2 }], 'value' being a positive number"
    );
  }
};
