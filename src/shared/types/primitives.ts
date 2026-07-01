export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type EntityId<TName extends string = "Entity"> = Brand<
  string,
  `${TName}Id`
>;

export type Nullable<TValue> = TValue | null;
