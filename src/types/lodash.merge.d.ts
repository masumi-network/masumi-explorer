declare module 'lodash.merge' {
  function merge<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TObject & TSource1 & TSource2;

  function merge<TObject, TSource>(
    object: TObject,
    ...sources: TSource[]
  ): TObject & TSource;

  export default merge;
} 