export enum PermissionType {
  DASHBOARD = "dashboard",
  CATEGORY = "category",
  PROFILE = "profile",
  ORDER = "order",
  PAYMENT = "payment",
  USER = "user",
  CONTENT = "content",
  ANALYTICS = "analytics",
  CUSTOMERS = "customers",
  CUSTOMIZATIONS = "customizations",
  APPOINTMENTS = "appointments",
  INVENTORY = "inventory",
  ROLES = "roles",
}

export enum PermissionSubType {
  ALL = "all",
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete",
  VIEW = "view",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  NOT_SPECIFIED = "not specified",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PLACED = "PLACED",
  PAYMENT_PENDING = "PAYMENT PENDING",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  PAYMENT_DONE = "PAYMENT DONE",
}

export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum CouponSubType {
  PRICE_REDUCTION = "price-reduction",
  PERCENTAGE_REDUCTION = "percentage-reduction",
}

export enum BlogReactionType {
  LIKE = "like",
  DISLIKE = "dislike",
  LOVE = "love",
  LAUGH = "laugh",
  ANGRY = "angry",
  SAD = "sad",
}
export enum PhoneCallStatus {
  PENDING = "PENDING",
  DONE = "DONE",
}

export enum OrderInitiationStatus {
  PENDING = "PENDING",
  DONE = "DONE",
}
export enum OrderTimeLine {
  ORDER_CREATED = "ORDER CREATED",
  APPOINTMENT_BOOKED = "APPOINTMENT BOOKED",
  PICKUP_PERSON_ASSIGNED = "PICKUP PERSON ASSIGNED",
  OUT_FOR_PICKUP = "OUT FOR PICKUP",
  PICKUP_COMPLETED = "PICKUP COMPLETED",
  RETURNED_TO_FACILITY = "RETURNED TO FACILITY",
  PAYMENT_DONE = "PAYMENT COMPLETED",
  ORDER_CANCELLED = "ORDER CANCELLED",
  ORDER_COMPLETED = "ORDER COMPLETED",
}

export enum OrderProcessingState {
  ORDER_INITIATED = "ORDER_INITIATED",
  ORDER_PLACED = "ORDER_PLACED",
  MATERIAL_DELIVERED_TO_WORKSHOP = "MATERIAL_DELIVERED_TO_WORKSHOP",
  ORDER_FULFILLED = "ORDER_FULFILLED",
  CUTTING_IN_PROGRESS = "CUTTING_IN_PROGRESS",
  CUTTING_COMPLETE = "CUTTING_COMPLETE",
  STITCHING_IN_PROGRESS = "STITCHING_IN_PROGRESS",
  STITCHING_COMPLETE = "STITCHING_COMPLETE",
  PRODUCT_VERIFIED_OR_RECTIFIED = "PRODUCT_VERIFIED_OR_RECTIFIED",
  MATERIAL_PACKED = "MATERIAL_PACKED",
  READY_FOR_DISPATCH = "READY_FOR_DISPATCH",
  ORDER_COMPLETE = "ORDER_COMPLETE",
}
