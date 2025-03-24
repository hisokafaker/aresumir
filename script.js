
// Inicializa Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://zsjachhzrceykfgwlnka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzamFjaGh6cmNleWtmZ3dsbmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODg2ODYsImV4cCI6MjA1ODM2NDY4Nn0.NKfK2SahHqufECi8MoOs2gHDhWLggMJ0m7KIoJAgilM';
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById("registrar").addEventListener("click", async () => {
  const usuario = document.getElementById("usuario").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if (!usuario || !correo || !pass) {
      alert("Todos los campos son obligatorios.");
      return;
  }

  try {
      // INSERTAR USUARIO EN LA BASE DE DATOS (SIN CIFRAR LA CONTRASEÑA)
      const { data, error } = await supabase
          .from("usuarios")
          .insert([{ usuario, correo, pass, admin: null }]);

      if (error) throw error;

      alert("Usuario registrado exitosamente.");
      console.log("Usuario registrado:", data);

  } catch (error) {
      console.error("Error:", error.message);
      alert("Error al registrar usuario: " + error.message);
  }
});

document.getElementById("iniciar").addEventListener("click", async () => {
  const correo = document.getElementById("correo").value.trim();
  const pass = document.getElementById("pass").value.trim();
  const recordar = document.getElementById("recordar").checked;

  if (!correo || !pass) {
      alert("Por favor, completa todos los campos.");
      return;
  }

  try {
      // Consultar el usuario en la tabla "usuarios"
      const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("correo", correo)
          .eq("pass", pass) // ⚠️ Comparando en texto plano (NO SEGURO)
          .single();

      if (error) throw error;
      if (!data) {
          alert("Correo o contraseña incorrectos.");
          return;
      }

      alert("Inicio de sesión exitoso.");
      console.log("Usuario autenticado:", data);

      // Guardar sesión en localStorage si se marca "Recordar"
      if (recordar) {
          localStorage.setItem("sesionUsuario", JSON.stringify(data));
      }

      // Reemplazar el botón de login por el menú de perfil
      cambiarBotonLogin(data.admin);

     

  } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Error: " + error.message);
  }
});

// Función para cambiar el botón de login
function cambiarBotonLogin(admin) {
  const loginButton = document.getElementById("login-container"); // Contenedor del botón

  if (loginButton) {
      loginButton.innerHTML = `
          <select class="form-select" id="perfilMenu" aria-label="Default select example">
              <option selected>Perfil</option>
              <option value="perfil">Perfil</option>
              <option value="logout">Cerrar sesión</option>
              ${admin === 'si' ? '<option value="admin">Panel Admin</option>' : ''}
          </select>
      `;

      // Agregar evento para cerrar sesión
      document.getElementById("perfilMenu").addEventListener("change", (event) => {
          if (event.target.value === "logout") {
              cerrarSesion();
          }
      });
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("sesionUsuario"); // Eliminar sesión
  alert("Sesión cerrada");
  location.reload(); // Recargar la página
}

// Al cargar la página, verificar si hay sesión activa
window.onload = () => {
  const usuario = JSON.parse(localStorage.getItem("sesionUsuario"));
  if (usuario) {
      cambiarBotonLogin(usuario.admin);
  }
};




document.getElementById("updateForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const newTitle = document.getElementById("newTitle").value;
  const newDescription = document.getElementById("newDescription").value;
  const videoUrl = document.getElementById("videoUrl").value;

  if (newTitle) {
    document.getElementById("title").textContent = newTitle;
  }
  if (newDescription) {
    document.getElementById("description").textContent = newDescription;
  }
  if (videoUrl) {
    try {
      const url = new URL(videoUrl);
      const videoId = url.searchParams.get("v");
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?start=0&end=120`;
        document.getElementById("videoFrame").src = embedUrl;
        document.getElementById("viewButton").href = videoUrl;
      } else {
        alert("Ingresa un enlace válido de YouTube.");
      }
    } catch {
      alert("Ingresa un enlace válido de YouTube.");
    }
  }
});

window.onload = () => {
  const usuario = JSON.parse(localStorage.getItem("sesionUsuario"));

  if (usuario) {
      cambiarBotonLogin(usuario.admin);

      // Ocultar el formulario si el usuario no es admin
      if (!usuario.admin || usuario.admin === null) {
          document.getElementById("administrador").style.display = "none";
      }
  }
};


document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("newTitle").value.trim();
  const description = document.getElementById("newDescription").value.trim();
  const videoUrl = document.getElementById("videoUrl").value.trim();

  const { data, error } = await supabase
      .from("nuevo")  // Nombre de la tabla
      .update({ title, description, video_url: videoUrl })
      .eq("id", "b09adc6b-9728-47d2-8a29-6586f193e329");  // Siempre actualiza este ID

  if (error) {
      console.error("Error al actualizar:", error.message);
      alert("Hubo un error al actualizar los datos.");
  } else {
      alert("Datos actualizados correctamente.");
      document.getElementById("updateForm").reset();
  }
});


document.addEventListener("DOMContentLoaded", async () => {

  
  try {
      const { data, error } = await supabase
          .from("nuevo")  // Nombre de la tabla
          .select("title, description, video_url")
          .eq("id", "b09adc6b-9728-47d2-8a29-6586f193e329")
          .single();  // Solo obtenemos un registro

      if (error) throw error;
      if (!data) {
          console.warn("No se encontró el capítulo.");
          return;
      }

      // Asignar los datos a los elementos del DOM
      document.getElementById("title").textContent = data.title;
      document.getElementById("description").textContent = data.description;

      if (data.video_url) {
          try {
              const url = new URL(data.video_url);
              const videoId = url.searchParams.get("v");

              if (videoId) {
                  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  document.getElementById("videoFrame").src = embedUrl;
                  document.getElementById("viewButton").href = data.video_url;
              } else {
                  console.warn("URL de YouTube no válida:", data.video_url);
              }
          } catch {
              console.warn("URL de YouTube no válida:", data.video_url);
          }
      }
  } catch (error) {
      console.error("Error al cargar los datos:", error.message);
  }
});

window.onload = () => {
  const usuario = JSON.parse(localStorage.getItem("sesionUsuario"));

  if (!usuario) {
      // Si no hay usuario logueado, ocultar los elementos con id="administrador"
      document.querySelectorAll("#administrador").forEach(el => el.style.display = "none");
  }
  else if(usuario){
    cambiarBotonLogin(usuario.admin);

      // Ocultar el formulario si el usuario no es admin
      if (!usuario.admin || usuario.admin === null) {
          document.getElementById("administrador").style.display = "none";
      }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("sesionUsuario"));
  const loginBtn = document.getElementById("login");
  const perfilMenu = document.getElementById("perfilMenu");
  
  if (usuario) {
      // Oculta el botón de login y muestra el menú de perfil
      loginBtn.style.display = "none";
      perfilMenu.style.display = "block";
  } else {
      // Si no hay sesión, muestra el botón de login
      loginBtn.style.display = "block";
      perfilMenu.style.display = "none";
  }
});

// Evento para iniciar sesión
document.getElementById("iniciar").addEventListener("click", async () => {
  const correo = document.getElementById("correo").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if (!correo || !pass) {
      alert("Por favor, completa todos los campos.");
      return;
  }

  try {
      const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("correo", correo)
          .eq("pass", pass)
          .single();

      if (error || !data) {
          alert("Correo o contraseña incorrectos.");
          return;
      }

      alert("Inicio de sesión exitoso.");
      console.log("Usuario autenticado:", data);

      // Guarda sesión en localStorage
      localStorage.setItem("sesionUsuario", JSON.stringify(data));

      // Oculta el botón de login y muestra el menú de perfil
      document.getElementById("login").style.display = "none";
      document.getElementById("perfilMenu").style.display = "block";

  } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Error: " + error.message);
  }
});

// Evento para cerrar sesión
document.getElementById("cerrarSesion").addEventListener("click", () => {
  localStorage.removeItem("sesionUsuario");
  alert("Sesión cerrada.");

  // Muestra el botón de login y oculta el menú de perfil
  document.getElementById("login").style.display = "block";
  document.getElementById("perfilMenu").style.display = "none";
});
