# 🎟️ Eventia

> Aplicación móvil para la búsqueda, reserva y venta de entradas para eventos.

Eventia es una plataforma móvil que conecta a usuarios interesados en asistir a eventos con organizadores que necesitan una solución para publicar eventos, gestionar entradas y controlar sus ventas.

---

## 📱 Sobre el proyecto

Eventia permite a los usuarios descubrir eventos, consultar su información, seleccionar entradas, realizar reservas o compras y obtener un ticket digital con código QR.

Por otro lado, los organizadores pueden publicar sus eventos, gestionar la disponibilidad de entradas, consultar sus ventas y utilizar los tickets digitales para controlar el ingreso.

---

## ✨ Funcionalidades

### 👤 Usuarios

- Registro e inicio de sesión.
- Gestión del perfil.
- Búsqueda de eventos.
- Filtrado por categoría, ubicación y fecha.
- Visualización de información del evento.
- Selección de entradas.
- Reserva de entradas.
- Compra de entradas.
- Consulta de compras.
- Visualización de tickets digitales.
- Código QR para el ingreso.

### 🏢 Organizadores

- Registro e inicio de sesión.
- Creación y publicación de eventos.
- Gestión de entradas disponibles.
- Administración de eventos.
- Consulta de ventas.
- Control de ingreso mediante códigos QR.

---

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura **Cliente-Servidor**, donde la aplicación móvil se comunica con el backend mediante una API REST.

```text
                    ┌──────────────────────┐
                    │      📱 Eventia      │
                    │   Expo Go / React    │
                    │       Native         │
                    └──────────┬───────────┘
                               │
                          HTTP / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │    ☕ Spring Boot    │
                    │         Java         │
                    │       REST API       │
                    └──────────┬───────────┘
                               │
                               │ JPA / Hibernate
                               ▼
                    ┌──────────────────────┐
                    │     🐘 PostgreSQL    │
                    │      Database        │
                    └──────────────────────┘
