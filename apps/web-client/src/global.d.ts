// ==================== GENERIC INTERFACES ==================== //
interface Phone {
  number: string; // Cambiado a string para soportar números internacionales
  prefix: string;
}

// ==================== CONTACT VIA EMAILS INTERFACES ==================== //

interface ContactInfo_ {
  firstName?: string;
  lastName?: string;
  fullName?: string; // Computed field: first_name + last_name
  socialReason?: string; // Para organizaciones (razón social)
  email: string;
  phone: Phone;
  document?: DocumentInfo;
  alternatePhone?: {
    prefix: string;
    number: string;
  };
  position?: string; // Cargo en la organización
  address?: string;
}

interface Email extends DefaultFirestoreProps {
  // id: string;
  // clientId: string;
  hostname: string;
  contactInfo: ContactInfo_;
  termsAndConditions: boolean;
  message?: string;
  type: "contact" | "claim";
  contactDetails?: Contact;
  claimDetails?: Claim;
  // status?: string;
  // archived?: boolean;
  // searchData: string[];
}

interface Contact {
  message?: string;
}

interface Claim {
  incidentDate: string;
  incidentTime: string;
  purchaseDate: string;
  invoiceNumber: string;
  claimMotive: string;
  productServiceDescription: string;
  problemDescription: string;
  claimedAmount: string;
  requestedSolution: string;
}

// ==================== ENUMS Y TIPOS AUXILIARES ==================== //

type LeadStatus =
  | "new" // Nuevo lead
  | "contacted" // Contactado
  | "qualified" // Calificado
  | "proposal" // Propuesta enviada
  | "negotiation" // En negociación
  | "won" // Ganado
  | "lost" // Perdido
  | "follow_up" // Seguimiento
  | "cancelled" // Cancelado
  | "in_service"; // En servicio (para service leads)

type LeadSource =
  | "website"
  | "phone"
  | "email"
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "google_ads"
  | "organic_search"
  | "referral"
  | "walk_in" // Cliente llega directamente
  | "other";

/**
 * Tipo de Atención - Genérico para cualquier empresa
 *
 * Define cómo se realizará el servicio o entrega:
 * - on_site: En las instalaciones de la empresa (tienda, oficina, etc.)
 * - at_customer: En el domicilio/ubicación del cliente
 * - remote: A distancia (online, telefónico, etc.)
 * - pickup: Cliente recoge el producto/resultado
 * - shipping: Envío al cliente
 * - quote_only: Solo cotización, sin servicio inmediato
 */
type AttendanceType =
  | "on_site" // En las instalaciones de la empresa
  | "at_customer" // En el domicilio/ubicación del cliente
  | "remote" // A distancia/remoto
  | "pickup" // Cliente recoge
  | "shipping" // Envío al cliente
  | "send_to_store" // Cliente envia al local
  | "quote_only" // Solo cotización
  | "other"; // Otro tipo de atención

type Priority = "low" | "medium" | "high" | "urgent";

type ServiceType =
  | "maintenance" // Mantenimiento preventivo/correctivo
  | "repair" // Reparación
  | "installation" // Instalación/implementación
  | "calibration" // Calibración/ajuste
  | "cleaning" // Limpieza/sanitización
  | "diagnosis" // Diagnóstico/evaluación
  | "warranty" // Servicio de garantía
  | "training" // Capacitación/entrenamiento
  | "consulting" // Consultoría/asesoría
  | "customization" // Personalización/configuración
  | "support" // Soporte técnico/atención
  | "inspection" // Inspección/auditoría
  | "delivery" // Entrega/envío
  | "other"; // Otro tipo de servicio

type LostReason =
  | "price_too_high" // Precio muy alto
  | "competitor" // Se fue con competencia
  | "timing" // Mal timing
  | "no_response" // No respondió
  | "no_budget" // Sin presupuesto
  | "not_interested" // No interesado
  | "other";

type ClientType = "individual" | "organization";

type LeadType =
  | "sale" // Venta de productos/bienes
  | "service"; // Prestación de servicios

// ==================== INTERFACES AUXILIARES ==================== //

interface ContactInfo {
  firstName?: string;
  lastName?: string;
  fullName?: string; // Computed field: firstName + lastName
  socialReason?: string; // Para organizaciones (razón social)
  email: string;
  phone: Phone;
  alternatePhone?: {
    prefix: string;
    number: string;
  };
  position?: string; // Cargo en la organización
}

interface AddressInfo {
  street?: string;
  state?: string; // Estado/Región/Departamento
  city?: string; // Ciudad/Provincia
  area?: string; // Zona/Distrito/Barrio
  postalCode?: string;
  country?: string; // País
  reference?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface DocumentInfo {
  type: "DNI" | "RUC" | "CE" | "PASSPORT" | "OTHER";
  number: string;
  verified?: boolean; // Si se verificó el documento
}

interface ProductItem {
  id: string;
  name?: string; // Nombre del producto
  quantity: number;
  brand: string;
  model: string;
  serialNumber?: string;
  condition?: "new" | "reconditioned" | "used"; // Estado del producto
  serviceType?: ServiceType;
  unitPrice?: number;
  totalPrice?: number;
  discount?: number; // Descuento en porcentaje
  tax?: number; // Impuesto aplicado
  notes?: string; // Notas específicas del producto
}

// Tipos específicos de entrega - Genérico para cualquier ubicación
type DeliveryType =
  | "pickup" // Recojo en punto de venta/oficina
  | "local_delivery" // Entrega local (misma ciudad)
  | "regional_delivery" // Entrega regional/nacional
  | "international"; // Envío internacional

interface DeliveryInfo {
  type: DeliveryType;

  // Para local_delivery - Entrega local
  localDelivery?: {
    preferredDate?: string; // ISO 8601
    preferredTime?: string;
    address: {
      area: string; // Zona/distrito/barrio
      street: string; // Dirección completa
      postalCode?: string;
    };
  };

  // Para regional_delivery - Envío regional/nacional
  regionalDelivery?: {
    address: {
      state?: string; // Estado/Región/Departamento
      city?: string; // Ciudad/Provincia
      area?: string; // Zona/Distrito
      street: string; // Dirección completa
      postalCode?: string;
    };
    estimatedDeliveryDays?: number; // Días estimados
    courierService?: string; // Nombre del courier
  };

  // Para international - Envío internacional
  internationalDelivery?: {
    address: {
      country: string;
      state?: string;
      city?: string;
      street: string;
      postalCode: string;
    };
    estimatedDeliveryDays?: number;
    courierService?: string;
    customsInfo?: string;
  };

  // Para pickup - No requiere campos adicionales
  // Solo se muestra la información del punto de recojo
}

interface VisitSchedule {
  preferredDate?: string; // ISO 8601
  preferredTime?: string;
  confirmedDate?: string; // ISO 8601
  confirmedTime?: string;
  completedDate?: string; // ISO 8601 - Fecha real de completación
  durationMinutes?: number;
  technicianAssigned?: string; // ID del técnico
  visitStatus?:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "rescheduled";
  cancellationReason?: string;
}

interface LeadTracking {
  source: LeadSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrerUrl?: string;
  landingPage?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
}

interface LeadTimestamps {
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastContactAt?: string; // ISO 8601
  convertedAt?: string; // ISO 8601 - Cuando se convierte en cliente
  closedAt?: string; // ISO 8601 - Cuando se cierra (won o lost)
  firstResponseAt?: string; // ISO 8601 - Primera respuesta del equipo
}

interface SalesMetrics {
  // Métricas específicas de ventas
  opportunityValue?: number; // Valor de la oportunidad
  probability?: number; // Probabilidad de cierre (0-100)
  forecastCategory?: "pipeline" | "best_case" | "commit" | "closed";
  salesCycleDays?: number; // Días en el ciclo de ventas
  touchpoints?: number; // Número de interacciones
}

// ==================== INTERFACES AGRUPADAS POR CONTEXTO ====================

// Detalles específicos para leads de tipo PRODUCTO/VENTA
interface ProductSaleDetails {
  products: ProductItem[];
  additionalInformation?: string;
  estimatedValue?: number;
  currency?: string; // ISO 4217: USD, EUR, PEN, MXN, etc.
  delivery?: DeliveryInfo;

  // Cotización
  quoteSent?: boolean;
  quoteNumber?: string;
  quoteAmount?: number;
  quoteValidUntil?: string; // ISO 8601
  discountPercentage?: number;
  discountAmount?: number;

  // Información financiera
  financial?: {
    subtotal?: number;
    taxAmount?: number;
    totalAmount?: number;
    paidAmount?: number;
    balance?: number;
    invoiceNumber?: string;
    invoiceDate?: string; // ISO 8601
    paymentStatus?: "pending" | "partial" | "paid" | "overdue";
  };

  paymentTerms?: string;
  paymentMethod?: "cash" | "card" | "bank_transfer" | "installments" | "other";
}

// Detalles específicos para leads de tipo SERVICIO
interface ServiceLeadDetails {
  products?: ProductItem[];
  serviceType?: ServiceType;
  additionalInformation?: string;

  // Equipo relacionado
  equipmentBrand?: string;
  equipmentModel?: string;
  equipmentSerial?: string;
  failureDescription?: string;
  warrantyStatus?: "in_warranty" | "out_of_warranty" | "unknown";

  // Costos y garantía
  estimatedCost?: number;
  finalCost?: number;
  warrantyIncluded?: boolean;
  warrantyMonths?: number;
  partsNeeded?: string[];
  laborHours?: number;
  urgencyLevel?: "normal" | "express" | "emergency";

  // Estado del servicio
  serviceCompleted?: boolean;
  serviceCompletionDate?: string; // ISO 8601

  // Tipo de atención
  attendanceType?: AttendanceType;

  // Agenda de visita
  visitSchedule?: VisitSchedule;
}

// Detalles específicos para cotizaciones
interface QuotationDetails {
  quoteSent: boolean;
  quoteNumber?: string;
  quoteAmount?: number;
  quoteValidUntil?: string; // ISO 8601
  discountPercentage?: number;
  discountAmount?: number;
  currency?: string; // ISO 4217: USD, EUR, PEN, MXN, etc.
  paymentTerms?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  notes?: string;
}

// Detalles de comunicación con el cliente
interface CommunicationDetails {
  preference?: "email" | "phone" | "whatsapp";
  preferredContactTime?: string;
  language?: "es" | "en";

  // Estado de emails enviados
  emailSentToUser?: boolean;
  emailSentToAdvisor?: boolean;
  lastEmailSentAt?: string; // ISO 8601
}

// Detalles de seguimiento del lead
interface FollowUpDetails {
  nextFollowUpDate?: string; // ISO 8601
  followUpCount?: number; // Número de seguimientos realizados

  // Recordatorios
  reminderSet?: boolean;
  reminderDate?: string; // ISO 8601
}

// Detalles de cierre del lead
interface ClosureDetails {
  // Fechas de cierre
  expectedCloseDate?: string; // ISO 8601
  actualCloseDate?: string; // ISO 8601

  // Razones de ganancia
  wonReason?: string;

  // Razones de pérdida
  lostReason?: LostReason;
  lostDetails?: string;
  competitorName?: string;
}

// ==================== INTERFAZ PRINCIPAL ====================
interface Lead extends Partial<DefaultFirestoreProps> {
  // ========================================
  // 📋 INFORMACIÓN BÁSICA DEL LEAD
  // ========================================
  id?: string;
  clientId?: string;
  leadType: LeadType;
  clientType: ClientType;
  status: LeadStatus;
  priority?: Priority;
  archived: boolean;
  hostname?: string;
  isQuoteRequest?: boolean; // true = solo solicita cotización, false = busca comprar/contratar

  // ========================================
  // 👤 INFORMACIÓN DE CONTACTO
  // ========================================
  contact: ContactInfo;
  document?: DocumentInfo;
  organizationInfo?: {
    taxId?: string; // ID fiscal (RUC, EIN, VAT, etc.)
    legalName?: string; // Razón social / Legal name
    tradeName?: string; // Nombre comercial
    industry?: string;
    employeeCount?: string;
    website?: string;
    contactPerson?: string;
    contactPosition?: string;
  };

  // ========================================
  // 📍 DIRECCIÓN Y UBICACIÓN
  // ========================================
  address?: AddressInfo;

  // ========================================
  // 🛍️ DETALLES AGRUPADOS POR TIPO DE LEAD
  // ========================================
  // Solo uno de estos debe estar presente según leadType
  productSaleDetails?: ProductSaleDetails; // Para leadType: "sale"
  serviceDetails?: ServiceLeadDetails; // Para leadType: "service"
  quotationDetails?: QuotationDetails; // Para cotizaciones independientes

  // ========================================
  // 📞 COMUNICACIÓN CON EL CLIENTE
  // ========================================
  communication?: CommunicationDetails;
  termsAndConditions: boolean;
  privacyPolicyAccepted?: boolean;

  // ========================================
  // 📅 SEGUIMIENTO DEL LEAD
  // ========================================
  followUp?: FollowUpDetails;

  // ========================================
  // 🎯 CIERRE DEL LEAD
  // ========================================
  closure?: ClosureDetails;

  // ========================================
  // 👥 ASIGNACIÓN Y GESTIÓN
  // ========================================
  assignedTo?: string; // ID del asesor/vendedor
  createdBy?: string;
  teamId?: string;
  department?: "sales" | "service" | "customer_service";

  // ========================================
  // 📝 NOTAS E HISTORIAL
  // ========================================
  notes?: string;
  internalComments?: string;
  history?: LeadHistoryEntry[];

  // ========================================
  // ⭐ FEEDBACK Y SATISFACCIÓN
  // ========================================
  customerRating?: number; // 1-5 estrellas
  customerFeedback?: string;
  npsScore?: number; // 0-10

  // ========================================
  // 📊 MÉTRICAS Y ANALYTICS
  // ========================================
  metrics?: SalesMetrics;

  // ========================================
  // 🔍 TRACKING Y ATRIBUCIÓN
  // ========================================
  tracking: LeadTracking;

  // ========================================
  // 📎 ARCHIVOS Y ETIQUETAS
  // ========================================
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string; // ISO 8601
  }[];
}

// ==================== TIPOS AUXILIARES ADICIONALES ====================

interface LeadHistoryEntry {
  action: string; // Ej: "status_changed", "contacted", "quote_sent"
  userId: string;
  userName?: string;
  timestamp: string; // ISO 8601
  oldValue?: unknown;
  newValue?: unknown;
  details?: Record<string, unknown>;
}
