precision mediump float;
uniform vec2 u_FogDist;
uniform vec3 u_FogColor;
varying vec4 v_color;
varying float v_dist;
varying vec4 shadowPos;
uniform sampler2D depthColorTexture;
float decodeFloat (vec4 color) {
  const vec4 bitShift = vec4(
    1.0 / (256.0 * 256.0 * 256.0),
    1.0 / (256.0 * 256.0),
    1.0 / 256.0,
    1
  );
  return dot(color, bitShift);
}
void main() {
  float fogFactor = (u_FogDist.y - v_dist) / (u_FogDist.y - u_FogDist.x);
  vec3 color = mix(u_FogColor, vec3(v_color), clamp(fogFactor, 0.0, 1.0));
  vec3 fragmentDepth = shadowPos.xyz;
  float shadowAcneRemover = 0.007;
  fragmentDepth.z -= shadowAcneRemover;
  float texelSize = 1.0 / shadowTexture.0;
  float amountInLight = 0.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      float texelDepth = decodeFloat(texture2D(depthColorTexture, fragmentDepth.xy + vec2(x, y) * texelSize));
      if (fragmentDepth.z < texelDepth) {
        amountInLight += 1.0;
      }
    }
  }
  amountInLight /= 9.0;
  amountInLight = max(amountInLight, 0.3);
  gl_FragColor = vec4(amountInLight * color, v_color.a);
}