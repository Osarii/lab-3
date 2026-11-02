import fs from 'fs';

const drawioXml = `<mxfile host="app.diagrams.net" modified="2026-11-02T14:30:00.000Z" agent="Antigravity" version="24.0.0" type="device">
  <diagram id="DER-Aduana" name="Diagrama ER Aduana">
    <mxGraphModel dx="1600" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1654" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- Titulo -->
        <mxCell id="title" value="SISTEMA DE INVENTARIO ADUANERO - DIAGRAMA ENTIDAD-RELACIÓN&#xa;Bases de Datos | Laboratorio #3 | Jared Prendas Ramírez" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#0F172A;" vertex="1" parent="1">
          <mxGeometry x="40" y="30" width="700" height="50" as="geometry" />
        </mxCell>

        <!-- Tabla pais -->
        <mxCell id="t_pais" value="pais&#xa;------------------------&#xa;PK id_pais : INT&#xa;nombre : VARCHAR(80) [UQ]&#xa;codigo_iso : CHAR(2) [UQ]&#xa;continente : VARCHAR(40)&#xa;acuerdo_comercial : BOOL" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="40" y="120" width="200" height="130" as="geometry" />
        </mxCell>

        <!-- Tabla agente_aduanal -->
        <mxCell id="t_agente" value="agente_aduanal&#xa;------------------------&#xa;PK id_agente : INT&#xa;nombre_completo : VARCHAR(120)&#xa;numero_licencia : VARCHAR(30) [UQ]&#xa;agencia_aduanal : VARCHAR(150)&#xa;telefono : VARCHAR(25)&#xa;correo : VARCHAR(100) [UQ]&#xa;estado_licencia : VARCHAR(20)" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="40" y="280" width="220" height="150" as="geometry" />
        </mxCell>

        <!-- Tabla operador_comercial -->
        <mxCell id="t_operador" value="operador_comercial&#xa;------------------------&#xa;PK id_operador : INT&#xa;razon_social : VARCHAR(150)&#xa;identificacion_tributaria : VARCHAR(30) [UQ]&#xa;tipo_operador : VARCHAR(20)&#xa;direccion : VARCHAR(200)&#xa;telefono : VARCHAR(25)&#xa;correo : VARCHAR(100) [UQ]&#xa;FK id_pais_sede : INT" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="40" y="460" width="220" height="170" as="geometry" />
        </mxCell>

        <!-- Tabla declaracion_aduanera -->
        <mxCell id="t_dua" value="declaracion_aduanera&#xa;------------------------&#xa;PK id_declaracion : INT&#xa;numero_dua : VARCHAR(30) [UQ]&#xa;fecha_registro : DATE&#xa;regimen : VARCHAR(25)&#xa;estado : VARCHAR(30)&#xa;total_cif_usd : DECIMAL(14,2)&#xa;arancel_total_usd : DECIMAL(14,2)&#xa;FK id_operador : INT&#xa;FK id_agente : INT&#xa;FK id_pais_origen : INT" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#B91C1C;fontColor=#ffffff;strokeColor=#991B1B;" vertex="1" parent="1">
          <mxGeometry x="340" y="280" width="230" height="200" as="geometry" />
        </mxCell>

        <!-- Tabla detalle_declaracion (N:M) -->
        <mxCell id="t_detalle" value="detalle_declaracion (N:M)&#xa;------------------------&#xa;PK id_detalle : INT&#xa;FK id_declaracion : INT&#xa;FK id_producto : INT&#xa;cantidad : INT&#xa;valor_declarado_usd : DECIMAL(12,2)&#xa;arancel_aplicado_usd : DECIMAL(12,2)" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#7C3AED;fontColor=#ffffff;strokeColor=#6D28D9;" vertex="1" parent="1">
          <mxGeometry x="650" y="280" width="230" height="150" as="geometry" />
        </mxCell>

        <!-- Tabla producto -->
        <mxCell id="t_producto" value="producto&#xa;------------------------&#xa;PK id_producto : INT&#xa;codigo_sku : VARCHAR(40) [UQ]&#xa;descripcion : VARCHAR(180)&#xa;unidad_medida : VARCHAR(30)&#xa;valor_unitario_usd : DECIMAL(12,2)&#xa;peso_unitario_kg : DECIMAL(8,2)&#xa;FK id_categoria : INT" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="960" y="280" width="220" height="160" as="geometry" />
        </mxCell>

        <!-- Tabla categoria_arancelaria -->
        <mxCell id="t_categoria" value="categoria_arancelaria&#xa;------------------------&#xa;PK id_categoria : INT&#xa;codigo_partida : VARCHAR(20) [UQ]&#xa;descripcion : VARCHAR(255)&#xa;porcentaje_arancel : DECIMAL(5,2)&#xa;requiere_permiso : BOOL" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="1260" y="280" width="230" height="130" as="geometry" />
        </mxCell>

        <!-- Tabla contenedor -->
        <mxCell id="t_contenedor" value="contenedor&#xa;------------------------&#xa;PK id_contenedor : INT&#xa;numero_contenedor : VARCHAR(20) [UQ]&#xa;tipo_contenedor : VARCHAR(30)&#xa;peso_bruto_kg : DECIMAL(10,2)&#xa;FK id_declaracion : INT" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="340" y="100" width="230" height="130" as="geometry" />
        </mxCell>

        <!-- Tabla inspeccion -->
        <mxCell id="t_inspeccion" value="inspeccion&#xa;------------------------&#xa;PK id_inspeccion : INT&#xa;fecha_inspeccion : DATETIME&#xa;canal_asignado : VARCHAR(15)&#xa;resultado : VARCHAR(30)&#xa;FK id_declaracion : INT&#xa;FK id_funcionario : INT" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="340" y="540" width="230" height="150" as="geometry" />
        </mxCell>

        <!-- Tabla funcionario (Recursiva) -->
        <mxCell id="t_funcionario" value="funcionario (Recursiva)&#xa;------------------------&#xa;PK id_funcionario : INT&#xa;nombre_completo : VARCHAR(120)&#xa;codigo_empleado : VARCHAR(20) [UQ]&#xa;cargo : VARCHAR(80)&#xa;departamento : VARCHAR(80)&#xa;correo_institucional : VARCHAR(100)&#xa;FK id_supervisor : INT [Recursiva]" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#059669;fontColor=#ffffff;strokeColor=#047857;" vertex="1" parent="1">
          <mxGeometry x="340" y="740" width="230" height="170" as="geometry" />
        </mxCell>

        <!-- Tabla bodega -->
        <mxCell id="t_bodega" value="bodega&#xa;------------------------&#xa;PK id_bodega : INT&#xa;codigo_bodega : VARCHAR(20) [UQ]&#xa;nombre : VARCHAR(100)&#xa;ubicacion : VARCHAR(150)&#xa;capacidad_maxima_m3 : DECIMAL&#xa;temperatura_controlada : BOOL" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#0284C7;fontColor=#ffffff;strokeColor=#0369A1;" vertex="1" parent="1">
          <mxGeometry x="960" y="540" width="220" height="150" as="geometry" />
        </mxCell>

        <!-- Tabla inventario_stock -->
        <mxCell id="t_stock" value="inventario_stock&#xa;------------------------&#xa;PK id_stock : INT&#xa;FK id_bodega : INT&#xa;FK id_producto : INT&#xa;FK id_declaracion : INT&#xa;cantidad : INT&#xa;fecha_ingreso : DATETIME&#xa;estado_stock : VARCHAR(30)" style="shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#D97706;fontColor=#ffffff;strokeColor=#B45309;" vertex="1" parent="1">
          <mxGeometry x="650" y="540" width="230" height="160" as="geometry" />
        </mxCell>

        <!-- Conexiones -->
        <mxCell id="c1" edge="1" parent="1" source="t_pais" target="t_dua">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c2" edge="1" parent="1" source="t_agente" target="t_dua">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c3" edge="1" parent="1" source="t_operador" target="t_dua">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c4" edge="1" parent="1" source="t_dua" target="t_contenedor">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c5" edge="1" parent="1" source="t_dua" target="t_detalle">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c6" edge="1" parent="1" source="t_producto" target="t_detalle">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c7" edge="1" parent="1" source="t_categoria" target="t_producto">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c8" edge="1" parent="1" source="t_dua" target="t_inspeccion">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c9" edge="1" parent="1" source="t_funcionario" target="t_inspeccion">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c10" edge="1" parent="1" source="t_bodega" target="t_stock">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="c11" edge="1" parent="1" source="t_producto" target="t_stock">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

const out1 = '/Users/osariii/Documents/lab-3/02_diagrama_er/Prendas_Jared_DER_Lab3.drawio';
const out2 = '/Users/osariii/Documents/lab-3/entregables/Prendas_Jared_DER_Lab3.drawio';

fs.writeFileSync(out1, drawioXml, 'utf8');
fs.copyFileSync(out1, out2);
console.log('Draw.io file generated successfully in:', out1, 'and', out2);
