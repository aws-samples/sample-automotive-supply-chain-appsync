export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AWSDate: { input: string; output: string; }
  AWSDateTime: { input: string; output: string; }
  AWSEmail: { input: string; output: string; }
  AWSIPAddress: { input: string; output: string; }
  AWSJSON: { input: string; output: string; }
  AWSPhone: { input: string; output: string; }
  AWSTime: { input: string; output: string; }
  AWSTimestamp: { input: number; output: number; }
  AWSURL: { input: string; output: string; }
};

export type Answer = {
  __typename?: 'Answer';
  booleanValue?: Maybe<Scalars['Boolean']['output']>;
  comments?: Maybe<Scalars['String']['output']>;
  instanceList?: Maybe<Array<Maybe<Instance>>>;
  lastUpdated: Scalars['String']['output'];
  questionId: Scalars['ID']['output'];
  value?: Maybe<Scalars['String']['output']>;
  values?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type AnswerInput = {
  booleanValue?: InputMaybe<Scalars['Boolean']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  instanceList?: InputMaybe<Array<InputMaybe<InstanceInput>>>;
  questionId: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
  values?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Assessment = {
  __typename?: 'Assessment';
  assessmentId: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ownerId: Scalars['String']['output'];
  progress?: Maybe<Progress>;
  template: Template;
};

export type CreateOrderInput = {
  fulfilled: Scalars['Boolean']['input'];
  orderDate: Scalars['String']['input'];
  orderId: Scalars['Int']['input'];
  partId: Scalars['Int']['input'];
  quantityOrdered: Scalars['Int']['input'];
};

export type CreatePartInput = {
  partCategory: Scalars['String']['input'];
  partId: Scalars['Int']['input'];
  partName: Scalars['String']['input'];
  unitPrice: Scalars['Int']['input'];
};

export type CreateShipmentInput = {
  partId: Scalars['Int']['input'];
  quantityShipped: Scalars['Int']['input'];
  shipmentDate: Scalars['String']['input'];
  shipmentId: Scalars['Int']['input'];
};

export type Instance = {
  __typename?: 'Instance';
  instanceType: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type InstanceInput = {
  instanceType: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAssessment?: Maybe<Assessment>;
  createOrder?: Maybe<Order>;
  createPart?: Maybe<Part>;
  createShipment?: Maybe<Shipment>;
  deleteAssessment?: Maybe<Assessment>;
  deleteOrder?: Maybe<Order>;
  deletePart?: Maybe<Part>;
  deleteShipment?: Maybe<Shipment>;
  updateAnswer?: Maybe<Progress>;
  updateAssessment?: Maybe<Assessment>;
  updateOrder?: Maybe<Order>;
  updatePart?: Maybe<Part>;
  updateProgress?: Maybe<Progress>;
  updateShipment?: Maybe<Shipment>;
};


export type MutationCreateAssessmentArgs = {
  name: Scalars['String']['input'];
  templateId: Scalars['String']['input'];
  versionId: Scalars['String']['input'];
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreatePartArgs = {
  input: CreatePartInput;
};


export type MutationCreateShipmentArgs = {
  input: CreateShipmentInput;
};


export type MutationDeleteAssessmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrderArgs = {
  orderId: Scalars['Int']['input'];
};


export type MutationDeletePartArgs = {
  partId: Scalars['Int']['input'];
};


export type MutationDeleteShipmentArgs = {
  shipmentId: Scalars['Int']['input'];
};


export type MutationUpdateAnswerArgs = {
  answer: AnswerInput;
  assessmentId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateAssessmentArgs = {
  input: UpdateAssessmentInput;
};


export type MutationUpdateOrderArgs = {
  input: UpdateOrderInput;
};


export type MutationUpdatePartArgs = {
  input: UpdatePartInput;
};


export type MutationUpdateProgressArgs = {
  assessmentId: Scalars['ID']['input'];
  completedQuestionId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateShipmentArgs = {
  input: UpdateShipmentInput;
};

export type Order = {
  __typename?: 'Order';
  fulfilled: Scalars['Boolean']['output'];
  orderDate: Scalars['String']['output'];
  orderId: Scalars['Int']['output'];
  partId: Scalars['Int']['output'];
  quantityOrdered: Scalars['Int']['output'];
};

export type Part = {
  __typename?: 'Part';
  partCategory: Scalars['String']['output'];
  partId: Scalars['Int']['output'];
  partName: Scalars['String']['output'];
  unitPrice: Scalars['Int']['output'];
};

export type PartBackorderRate = {
  __typename?: 'PartBackorderRate';
  backorderRate: Scalars['Float']['output'];
  partName: Scalars['String']['output'];
};

export type PartLeadTime = {
  __typename?: 'PartLeadTime';
  avgLeadTime: Scalars['Int']['output'];
  partName: Scalars['String']['output'];
};

export type PartOrderFillRate = {
  __typename?: 'PartOrderFillRate';
  orderFillRate: Scalars['Float']['output'];
  partName: Scalars['String']['output'];
};

export type PartSafetyStockLevel = {
  __typename?: 'PartSafetyStockLevel';
  avgLeadTime: Scalars['Float']['output'];
  demandStddev: Scalars['Float']['output'];
  partName: Scalars['String']['output'];
  safetyStockLevel: Scalars['Float']['output'];
};

export type Progress = {
  __typename?: 'Progress';
  completedQuestions: Array<Maybe<Scalars['ID']['output']>>;
  lastUpdated: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  calculateBackOrderRate: Array<PartBackorderRate>;
  calculateLeadTime: Array<PartLeadTime>;
  calculateOrderFillRate: Array<PartOrderFillRate>;
  calculateSafetyStockLevel: Array<PartSafetyStockLevel>;
  getAssessment?: Maybe<Assessment>;
  getOrder?: Maybe<Order>;
  getPart?: Maybe<Part>;
  getShipment?: Maybe<Shipment>;
  listAssessments?: Maybe<Array<Maybe<Assessment>>>;
  listOrders?: Maybe<Array<Maybe<Order>>>;
  listParts?: Maybe<Array<Maybe<Part>>>;
  listShipments?: Maybe<Array<Maybe<Shipment>>>;
};


export type QueryGetAssessmentArgs = {
  assessmentId: Scalars['ID']['input'];
};


export type QueryGetOrderArgs = {
  orderId: Scalars['Int']['input'];
};


export type QueryGetPartArgs = {
  partId: Scalars['Int']['input'];
};


export type QueryGetShipmentArgs = {
  shipmentId: Scalars['Int']['input'];
};

export type Question = {
  __typename?: 'Question';
  answer?: Maybe<Answer>;
  options?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  questionId: Scalars['ID']['output'];
  section: Scalars['String']['output'];
  type: QuestionType;
};

export enum QuestionType {
  Boolean = 'BOOLEAN',
  InstanceList = 'INSTANCE_LIST',
  Multi = 'MULTI',
  Single = 'SINGLE'
}

export type Section = {
  __typename?: 'Section';
  name: Scalars['String']['output'];
  questions: Array<Question>;
  sectionId: Scalars['ID']['output'];
};

export type Shipment = {
  __typename?: 'Shipment';
  partId: Scalars['Int']['output'];
  quantityShipped: Scalars['Int']['output'];
  shipmentDate: Scalars['String']['output'];
  shipmentId: Scalars['Int']['output'];
};

export type Template = {
  __typename?: 'Template';
  name: Scalars['String']['output'];
  ownerId: Scalars['String']['output'];
  sections: Array<Section>;
  templateId: Scalars['ID']['output'];
  version: Scalars['Int']['output'];
};

export type UpdateAssessmentInput = {
  assessmentIdd: Scalars['ID']['input'];
  businessObjective?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  specificRequirements?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderInput = {
  fulfilled?: InputMaybe<Scalars['Boolean']['input']>;
  orderDate?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['Int']['input'];
  partId?: InputMaybe<Scalars['Int']['input']>;
  quantityOrdered?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdatePartInput = {
  partCategory?: InputMaybe<Scalars['String']['input']>;
  partId: Scalars['Int']['input'];
  partName?: InputMaybe<Scalars['String']['input']>;
  unitPrice?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShipmentInput = {
  partId?: InputMaybe<Scalars['Int']['input']>;
  quantityShipped?: InputMaybe<Scalars['Int']['input']>;
  shipmentDate?: InputMaybe<Scalars['String']['input']>;
  shipmentId: Scalars['Int']['input'];
};
