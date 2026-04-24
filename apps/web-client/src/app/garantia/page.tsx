import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#112237] text-zinc-100 normal-case">
      <section className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-16 normal-case">
        <header className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 normal-case">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl normal-case">
            Politica de Garantia Comercial
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300 md:text-base normal-case">
            La presente Politica de Garantia Comercial regula las condiciones
            aplicables a los productos nuevos comercializados por IUBIZON
            COMPANY SAC dentro del territorio de la Republica del Peru. Esta
            politica se interpreta de manera sistematica con la normativa de
            proteccion al consumidor vigente y con los terminos de venta
            aceptados al momento de la compra.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-200 md:text-base normal-case">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
            <h2 className="text-xl font-semibold text-zinc-50">
              1. Objeto y Plazo de Cobertura
            </h2>
            <p className="mt-3">
              IUBIZON COMPANY SAC otorga una garantia comercial de doce (12)
              meses, computados desde la fecha de emision del comprobante de
              pago, exclusivamente respecto de defectos de fabricacion o fallas
              tecnicas no atribuibles al uso inadecuado del producto.
            </p>
            <p className="mt-3">
              La cobertura aplica unicamente a productos nuevos comercializados
              por IUBIZON COMPANY SAC y sujetos a identificacion mediante numero
              de serie u otro mecanismo de trazabilidad definido por la empresa.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
            <h2 className="text-xl font-semibold text-zinc-50">
              2. Titularidad y Requisitos de Atencion
            </h2>
            <p className="mt-3">
              Para acceder a la garantia, el solicitante debera acreditar de
              forma concurrente:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Identidad del titular o representante autorizado.</li>
              <li>
                Comprobante de pago legible emitido por IUBIZON COMPANY SAC.
              </li>
              <li>
                Coincidencia del producto con su numero de serie o etiqueta
                original.
              </li>
              <li>
                Entrega del producto completo para diagnostico tecnico cuando
                corresponda.
              </li>
            </ul>
            <p className="mt-3">
              La falta de cualquiera de estos requisitos faculta a IUBIZON
              COMPANY SAC a suspender el procedimiento hasta su regularizacion.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
            <h2 className="text-xl font-semibold text-zinc-50">
              3. Alcance de la Garantia
            </h2>
            <p className="mt-3">
              Verificada la procedencia de la garantia, IUBIZON COMPANY SAC,
              conforme a evaluacion tecnica y disponibilidad operativa, aplicara
              una de las siguientes medidas en orden de razonabilidad
              empresarial:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Diagnostico y reparacion del producto sin costo por mano de obra
                cubierta.
              </li>
              <li>
                Reemplazo por unidad equivalente, nueva o reacondicionada
                certificada.
              </li>
              <li>
                Emision de nota de credito o solucion comercial equivalente.
              </li>
            </ul>
            <p className="mt-3">
              La decision sobre la medida idonea corresponde a IUBIZON COMPANY
              SAC, sin perjuicio de los derechos minimos reconocidos por la
              normativa aplicable.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
            <h2 className="text-xl font-semibold text-zinc-50">
              4. Exclusiones y Causales de Improcedencia
            </h2>
            <p className="mt-3">La garantia no cubre, entre otros supuestos:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Danos por uso indebido, negligencia, golpes, humedad, liquidos o
                sobrecarga electrica.
              </li>
              <li>
                Desgaste normal por uso, consumibles, accesorios y piezas de
                recambio periodico.
              </li>
              <li>
                Manipulacion, reparacion o intervencion por terceros no
                autorizados.
              </li>
              <li>
                Alteracion, remocion o ilegibilidad del numero de serie o sellos
                de control.
              </li>
              <li>
                Eventos de caso fortuito, fuerza mayor o causas externas no
                imputables a iubizon.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
            <h2 className="text-xl font-semibold text-zinc-50">
              5. Procedimiento y Plazos de Atencion
            </h2>
            <p className="mt-3">
              Todo ingreso por garantia se sujeta a registro de recepcion y
              evaluacion tecnica previa. Los plazos de atencion seran informados
              caso por caso en funcion de la naturaleza de la falla,
              disponibilidad de repuestos y tiempos logisticos razonables.
            </p>
            <p className="mt-3">
              Cuando se requiera informacion adicional o validacion documental,
              el computo de plazos podra suspenderse hasta que el consumidor
              subsane lo requerido.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
            <h2 className="text-xl font-semibold text-zinc-50">
              6. Derechos del Consumidor en el Peru
            </h2>
            <p className="mt-3">
              La presente politica no desconoce los derechos irrenunciables del
              consumidor previstos por la legislacion peruana vigente. Cualquier
              controversia podra ser canalizada ante la autoridad competente,
              sin perjuicio de los mecanismos de solucion directa ofrecidos por
              IUBIZON COMPANY SAC.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7">
            <h2 className="text-xl font-semibold text-zinc-50">
              7. Modificaciones de la Politica
            </h2>
            <p className="mt-3">
              IUBIZON COMPANY SAC podra modificar la presente Politica de
              Garantia Comercial en cualquier momento. Toda modificacion tendra
              aplicacion prospectiva desde su fecha de publicacion y no afectara
              procedimientos de garantia ya iniciados con anterioridad.
            </p>
          </section>
        </div>

        <footer className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300 md:p-8">
          <p className="font-medium text-zinc-100 normal-case">
            IUBIZON COMPANY SAC
          </p>
          <p className="mt-1">RUC: 20614600374</p>
          <p className="mt-1">
            Domicilio legal: CAL.LAS ACACIAS NRO. 181 URB. LA VILLA LIMA - LIMA
            - CHORRILLOS
          </p>
          <p className="mt-4 text-zinc-400">Ultima actualizacion: 01/09/2025</p>
        </footer>
      </section>
    </main>
  );
}
