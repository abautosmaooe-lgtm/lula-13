/**
 * Pixel Art Sprites & Scenery Renderers for Lulalá - Caminho da Estrela
 * Faithful 16-bit retro canvas art matching the user's reference images:
 * - President Lula in suit and beard
 * - Super Lula flying with heroic red cape & star crest
 * - Metalworker Lula (ABC Paulista)
 * - Historic stages & special collectibles
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type?: 'sparkle' | 'heart' | 'gear' | 'book' | 'star';
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  vy: number;
  life: number;
}

export class SpriteRenderer {
  /**
   * Draws Lula (The President / The Worker / Super Hero)
   */
  public static drawLula(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    facingRight: boolean,
    state: 'idle' | 'walk' | 'jump' | 'crouch' | 'victory' | 'dead' | 'fly' | 'roll',
    frame: number,
    isSuper: boolean,
    isFlying: boolean,
    isInvincible: boolean,
    invincibleTimer: number,
    theme: 'abc' | 'comicio' | 'planalto',
    activeMod: 'none' | 'heroi_voo' | 'marombeiro' | 'lancador_agua' = 'none',
    powerTimer: number = 0
  ) {
    // Invincibility flashing
    if (isInvincible && Math.floor(invincibleTimer * 10) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(Math.round(x + width / 2), Math.round(y + height / 2));
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    // 0. Sonic-Style Spinning Star Roll (Giro da Estrela Sonic Atropela Tudo)
    if (state === 'roll') {
      const rot = (frame * 36) * (facingRight ? 1 : -1);

      // Trailing Afterimages (Ghost Stars for Sonic speed blur)
      for (let trail = 2; trail >= 1; trail--) {
        const trailOffset = -trail * 14;
        const trailRot = rot - trail * 1.8 * (facingRight ? 1 : -1);
        ctx.save();
        ctx.translate(trailOffset, 4);
        ctx.rotate(trailRot);
        ctx.fillStyle = trail === 1 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(250, 204, 21, 0.2)';
        ctx.beginPath();
        const tStarR = 15 - trail * 2;
        const tInnerR = 7 - trail;
        for (let i = 0; i < 5; i++) {
          const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const innerA = outerA + (2 * Math.PI) / 10;
          if (i === 0) ctx.moveTo(Math.cos(outerA) * tStarR, Math.sin(outerA) * tStarR);
          else ctx.lineTo(Math.cos(outerA) * tStarR, Math.sin(outerA) * tStarR);
          ctx.lineTo(Math.cos(innerA) * tInnerR, Math.sin(innerA) * tInnerR);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Outer golden sonic spindash shockwave aura
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 4, 22, 0, Math.PI * 2);
      ctx.fill();

      // Outer sonic golden ring with pulse
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 4, 19 + Math.sin(frame * 20) * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Sonic speed streak lines behind the rolling star
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-28, 0 + Math.sin(frame * 24) * 6, 12, 3);
      ctx.fillRect(-32, 7 + Math.cos(frame * 24) * 6, 14, 3);
      ctx.fillRect(-26, 14, 10, 3);

      // Rotating Star Wheel
      ctx.save();
      ctx.translate(0, 4);
      ctx.rotate(rot);

      // 5-Pointed Blazing Red Star with Golden Outlines
      ctx.fillStyle = '#dc2626'; // Red star core
      ctx.strokeStyle = '#fef08a'; // Glowing golden rim
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const starRadius = 18;
      const innerRadius = 8.5;
      for (let i = 0; i < 5; i++) {
        const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const innerA = outerA + (2 * Math.PI) / 10;
        if (i === 0) ctx.moveTo(Math.cos(outerA) * starRadius, Math.sin(outerA) * starRadius);
        else ctx.lineTo(Math.cos(outerA) * starRadius, Math.sin(outerA) * starRadius);
        ctx.lineTo(Math.cos(innerA) * innerRadius, Math.sin(innerA) * innerRadius);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden inner teeth / sonic wheel spokes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-3, -3, 6, 6);

      // White star tip sparks
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        ctx.fillRect(Math.cos(outerA) * 15 - 1.5, Math.sin(outerA) * 15 - 1.5, 3, 3);
      }

      // Pure white shining center
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();
      return;
    }

    // Flying tilt
    if (isFlying || state === 'fly' || activeMod === 'heroi_voo') {
      ctx.rotate(0.25);
    }

    const s = 2; // pixel scale unit
    const ox = -8 * s;
    const oy = -12 * s;

    // Palette
    const skin = '#fcd0a1';
    const hair = '#f8fafc'; // Characteristic white hair and beard
    const beard = '#e2e8f0';
    const eyes = '#0f172a';

    // Clothing palette based on stage / powerup / active mod
    const isWorker = theme === 'abc' && !isSuper && activeMod === 'none';
    let suitColor = isWorker ? '#1d4ed8' : '#1e293b';
    const tieColor = '#dc2626';
    const shirtColor = '#ffffff';
    const shoes = '#0f172a';

    if (activeMod === 'marombeiro') {
      suitColor = '#dc2626'; // Red gym tank top!
    } else if (activeMod === 'lancador_agua') {
      suitColor = '#ca8a04'; // Firefighter coat!
    }

    // 1. Hero Cape & Flight Lighting (Luzes Brancas Radiantes!)
    const hasCape = isSuper || isFlying || activeMod === 'heroi_voo';
    if (hasCape) {
      const capeWave = Math.sin(frame * 12) * 4;
      // AO VOAR: AO INVÉS DA COR VERMELHA, TROCA POR LUZES BRANCAS RADIANTES!
      const isWhiteFlight = isFlying || activeMod === 'heroi_voo';
      const capeColor = isWhiteFlight ? '#ffffff' : '#dc2626';

      // Radiant White Light Halo when flying!
      if (isWhiteFlight) {
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(ox + 8 * s, oy + 12 * s, 18 * s + Math.sin(frame * 16) * 3, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering white stars / sparks around flying hero
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox - 10 * s, oy + (frame % 8) * s, 3, 3);
        ctx.fillRect(ox - 14 * s, oy + 16 * s + Math.cos(frame * 10) * 4, 4, 4);
        ctx.fillRect(ox + 16 * s, oy - 2 * s, 3, 3);
        ctx.restore();
      }

      ctx.fillStyle = capeColor;
      ctx.beginPath();
      if (isFlying || activeMod === 'heroi_voo') {
        // Streamlined flying cape billowing behind
        ctx.moveTo(ox - 2 * s, oy + 8 * s);
        ctx.lineTo(ox - 18 * s, oy + 4 * s + capeWave);
        ctx.lineTo(ox - 16 * s, oy + 16 * s + capeWave);
        ctx.lineTo(ox + 2 * s, oy + 14 * s);
      } else {
        // Standing / walking flowing cape
        ctx.moveTo(ox + 1 * s, oy + 9 * s);
        ctx.lineTo(ox - 8 * s, oy + 22 * s + capeWave);
        ctx.lineTo(ox + 1 * s, oy + 24 * s);
        ctx.lineTo(ox + 5 * s, oy + 11 * s);
      }
      ctx.closePath();
      ctx.fill();

      // Cape trim
      ctx.fillStyle = isWhiteFlight ? '#38bdf8' : '#facc15';
      ctx.fillRect(ox - 6 * s, oy + 12 * s + capeWave * 0.5, 3, 3);
    }

    // Dead animation
    if (state === 'dead') {
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 3 * s, oy + 1 * s, 10 * s, 5 * s);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 4 * s, oy + 6 * s, 8 * s, 6 * s);
      ctx.fillStyle = beard;
      ctx.fillRect(ox + 4 * s, oy + 10 * s, 8 * s, 4 * s);
      ctx.fillStyle = eyes;
      ctx.fillText('x x', ox + 4 * s, oy + 9 * s);
      ctx.fillStyle = suitColor;
      ctx.fillRect(ox + 3 * s, oy + 14 * s, 10 * s, 6 * s);
      ctx.restore();
      return;
    }

    // 2. Head & Helmet (Mod Lançador de Água adds Firefighter Helmet)
    if (activeMod === 'lancador_agua') {
      // Firefighter safety helmet
      ctx.fillStyle = '#eab308'; // Yellow helmet
      ctx.fillRect(ox + 2 * s, oy - 2 * s, 12 * s, 6 * s);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(ox + 1 * s, oy + 2 * s, 14 * s, 2 * s);
      // Silver reflective badge
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 7 * s, oy - 1 * s, 2 * s, 3 * s);
    } else {
      // White Hair
      ctx.fillStyle = hair;
      ctx.fillRect(ox + 3 * s, oy + 0 * s, 10 * s, 5 * s);
      ctx.fillRect(ox + 2 * s, oy + 2 * s, 2 * s, 6 * s);
      ctx.fillRect(ox + 12 * s, oy + 2 * s, 2 * s, 5 * s);
    }

    // 3. Face / Skin
    ctx.fillStyle = skin;
    ctx.fillRect(ox + 4 * s, oy + 4 * s, 8 * s, 7 * s);

    // 4. White Beard and Mustache
    ctx.fillStyle = beard;
    ctx.fillRect(ox + 4 * s, oy + 8 * s, 8 * s, 5 * s);
    ctx.fillRect(ox + 3 * s, oy + 7 * s, 2 * s, 4 * s); // Sideburns
    ctx.fillRect(ox + 11 * s, oy + 7 * s, 2 * s, 4 * s);

    // Friendly smile / mouth in beard
    ctx.fillStyle = '#78350f';
    ctx.fillRect(ox + 7 * s, oy + 10 * s, 3 * s, 1 * s);

    // Eyes
    ctx.fillStyle = eyes;
    ctx.fillRect(ox + 8 * s, oy + 5 * s, 2 * s, 2 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 9 * s, oy + 5 * s, 1 * s, 1 * s);

    // 5. Torso / Costume
    if (activeMod === 'marombeiro') {
      // MOD MAROMBEIRO: Fisiculturista com peitorais gigantes e regata cavada de treino!
      ctx.fillStyle = skin; // Bare muscular shoulders & chest
      ctx.fillRect(ox + 1 * s, oy + 12 * s, 14 * s, 7 * s);
      // Red stringer gym tank top
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ox + 4 * s, oy + 12 * s, 8 * s, 7 * s);
      // Muscle striation / chest cleavage
      ctx.fillStyle = '#b45309';
      ctx.fillRect(ox + 7 * s, oy + 13 * s, 2 * s, 4 * s);
      // Golden champion belt buckle
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox + 5 * s, oy + 18 * s, 6 * s, 2 * s);
    } else {
      // Normal Suit or Firefighter uniform
      ctx.fillStyle = suitColor;
      ctx.fillRect(ox + 3 * s, oy + 12 * s, 10 * s, 7 * s);

      if (activeMod === 'lancador_agua') {
        // Firefighter silver reflective stripes
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(ox + 3 * s, oy + 14 * s, 10 * s, 2 * s);
      } else {
        // White Shirt V & Red Tie
        ctx.fillStyle = shirtColor;
        ctx.fillRect(ox + 6 * s, oy + 12 * s, 4 * s, 4 * s);
        ctx.fillStyle = tieColor;
        ctx.fillRect(ox + 7 * s, oy + 13 * s, 2 * s, 6 * s);
      }
    }

    // Star Emblem on Chest
    if (isSuper || activeMod === 'heroi_voo') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ox + 4 * s, oy + 13 * s, 3 * s, 3 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 5 * s, oy + 14 * s, 1 * s, 1 * s);
    }

    // 6. Arms & Hands
    if (activeMod === 'marombeiro') {
      // Bulging biceps and forearms (muscular flex!)
      ctx.fillStyle = skin;
      ctx.fillRect(ox - 2 * s, oy + 11 * s, 5 * s, 7 * s); // Huge left bicep!
      ctx.fillRect(ox + 13 * s, oy + 11 * s, 5 * s, 7 * s); // Huge right bicep!
      // Flexing fists
      ctx.fillRect(ox - 2 * s, oy + 8 * s, 4 * s, 4 * s);
      ctx.fillRect(ox + 14 * s, oy + 8 * s, 4 * s, 4 * s);
      // Vascular muscle lines
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(ox - 1 * s, oy + 12 * s, 1 * s, 4 * s);
      ctx.fillRect(ox + 15 * s, oy + 12 * s, 1 * s, 4 * s);
    } else if (activeMod === 'lancador_agua') {
      // Fire hose held in hands pointing forward
      ctx.fillStyle = suitColor;
      ctx.fillRect(ox + 2 * s, oy + 13 * s, 3 * s, 5 * s);
      ctx.fillRect(ox + 11 * s, oy + 13 * s, 6 * s, 4 * s);
      // Brass water nozzle
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(ox + 17 * s, oy + 12 * s, 5 * s, 4 * s);
      ctx.fillStyle = '#0284c7'; // Water droplet ready
      ctx.fillRect(ox + 22 * s, oy + 13 * s, 2 * s, 2 * s);
    } else if (isFlying || state === 'fly') {
      ctx.fillStyle = suitColor;
      ctx.fillRect(ox + 11 * s, oy + 9 * s, 7 * s, 3 * s);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 18 * s, oy + 8 * s, 3 * s, 4 * s);
    } else if (state === 'victory') {
      ctx.fillStyle = suitColor;
      ctx.fillRect(ox + 1 * s, oy + 6 * s, 2 * s, 6 * s);
      ctx.fillRect(ox + 13 * s, oy + 6 * s, 2 * s, 6 * s);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 0 * s, oy + 4 * s, 3 * s, 3 * s);
      ctx.fillRect(ox + 13 * s, oy + 4 * s, 3 * s, 3 * s);
    } else {
      ctx.fillStyle = suitColor;
      ctx.fillRect(ox + 2 * s, oy + 13 * s, 2 * s, 5 * s);
      ctx.fillRect(ox + 12 * s, oy + 13 * s, 2 * s, 5 * s);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 2 * s, oy + 17 * s, 2 * s, 2 * s);
      ctx.fillRect(ox + 12 * s, oy + 17 * s, 2 * s, 2 * s);
    }

    // 7. Legs / Trousers & Shoes
    const legsColor = activeMod === 'marombeiro' ? '#1e293b' : suitColor;
    ctx.fillStyle = legsColor;
    const walkStep = Math.floor(frame * 6) % 4;

    if (isFlying || state === 'fly') {
      ctx.fillRect(ox + 3 * s, oy + 19 * s, 8 * s, 3 * s);
      ctx.fillStyle = shoes;
      ctx.fillRect(ox + 2 * s, oy + 21 * s, 4 * s, 2 * s);
      ctx.fillRect(ox + 7 * s, oy + 21 * s, 4 * s, 2 * s);
    } else if (state === 'jump') {
      ctx.fillRect(ox + 4 * s, oy + 18 * s, 3 * s, 4 * s);
      ctx.fillRect(ox + 9 * s, oy + 18 * s, 3 * s, 3 * s);
      ctx.fillStyle = shoes;
      ctx.fillRect(ox + 3 * s, oy + 21 * s, 4 * s, 2 * s);
      ctx.fillRect(ox + 9 * s, oy + 20 * s, 4 * s, 2 * s);
    } else if (state === 'crouch') {
      ctx.fillRect(ox + 3 * s, oy + 17 * s, 10 * s, 3 * s);
      ctx.fillStyle = shoes;
      ctx.fillRect(ox + 2 * s, oy + 20 * s, 12 * s, 3 * s);
    } else if (state === 'walk') {
      if (walkStep === 0 || walkStep === 2) {
        ctx.fillRect(ox + 4 * s, oy + 18 * s, 3 * s, 4 * s);
        ctx.fillRect(ox + 9 * s, oy + 18 * s, 3 * s, 4 * s);
        ctx.fillStyle = shoes;
        ctx.fillRect(ox + 3 * s, oy + 21 * s, 4 * s, 3 * s);
        ctx.fillRect(ox + 9 * s, oy + 21 * s, 4 * s, 3 * s);
      } else {
        ctx.fillRect(ox + 3 * s, oy + 18 * s, 3 * s, 3 * s);
        ctx.fillRect(ox + 10 * s, oy + 18 * s, 3 * s, 4 * s);
        ctx.fillStyle = shoes;
        ctx.fillRect(ox + 2 * s, oy + 20 * s, 4 * s, 3 * s);
        ctx.fillRect(ox + 10 * s, oy + 21 * s, 4 * s, 3 * s);
      }
    } else {
      ctx.fillRect(ox + 4 * s, oy + 18 * s, 3 * s, 4 * s);
      ctx.fillRect(ox + 9 * s, oy + 18 * s, 3 * s, 4 * s);
      ctx.fillStyle = shoes;
      ctx.fillRect(ox + 3 * s, oy + 21 * s, 4 * s, 3 * s);
      ctx.fillRect(ox + 9 * s, oy + 21 * s, 4 * s, 3 * s);
    }

    // 10-Second Power Countdown Overhead Badge
    if (activeMod !== 'none' && powerTimer > 0) {
      const secs = Math.ceil(powerTimer);
      const isCritical = powerTimer <= 3.0;
      const isBlinking = isCritical && Math.floor(powerTimer * 8) % 2 === 0;

      ctx.save();
      // Counteract facingRight flip so text is always readable left-to-right
      if (!facingRight) ctx.scale(-1, 1);

      const badgeColor = isBlinking ? '#ef4444' : isCritical ? '#f97316' : '#facc15';

      // Badge background pill
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(-18, oy - 16, 36, 12);
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-18, oy - 16, 36, 12);

      // Mini timer text: e.g. "⏱ 9s"
      ctx.fillStyle = badgeColor;
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⏱${secs}s`, 0, oy - 10);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Carteira de Trabalho (CTPS) - Equipamento Básico do Trabalhador
   */
  public static drawCarteiraTrabalho(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    floatOffset: number = 0
  ) {
    const drawY = y + floatOffset;
    // Blue CTPS passport
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x, drawY, width, height);

    // Spine
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x, drawY, 3, height);

    // Gold Brazilian Emblem on cover
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x + width / 2, drawY + height / 2 - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Text lines: "REPÚBLICA FEDERATIVA DO BRASIL"
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 5, drawY + height - 6, width - 10, 2);

    ctx.strokeStyle = '#172554';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, drawY, width, height);
  }

  /**
   * Estrela Vermelha - Invencibilidade Temporária e Poder de Voo
   */
  public static drawEstrelaVermelha(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    animTime: number
  ) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const pulse = 1 + Math.sin(animTime * 8) * 0.1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);

    // 5-pointed star
    ctx.fillStyle = '#dc2626'; // Vibrant Red
    ctx.strokeStyle = '#facc15'; // Golden glow
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + (2 * Math.PI) / 10;
      const rOuter = size / 2;
      const rInner = size / 4;

      if (i === 0) {
        ctx.moveTo(Math.cos(outerAngle) * rOuter, Math.sin(outerAngle) * rOuter);
      } else {
        ctx.lineTo(Math.cos(outerAngle) * rOuter, Math.sin(outerAngle) * rOuter);
      }
      ctx.lineTo(Math.cos(innerAngle) * rInner, Math.sin(innerAngle) * rInner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White shine in center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -2, 4, 4);

    ctx.restore();
  }

  /**
   * POVO FELIZ - Coletável Especial de Esperança e Força Popular
   * Representa o povo brasileiro sorrindo, com bandeirinhas e corações de alegria!
   */
  public static drawPovoFeliz(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    floatOffset: number = 0
  ) {
    const drawY = y + floatOffset;

    // Glowing golden-green halo
    ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.beginPath();
    ctx.arc(x + size / 2, drawY + size / 2, size / 2 + 4, 0, Math.PI * 2);
    ctx.fill();

    // Group of smiling people celebrating!
    // Person 1 (Center - Yellow and Green shirt)
    ctx.fillStyle = '#fcd0a1'; // Face
    ctx.beginPath();
    ctx.arc(x + size / 2, drawY + 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + size / 2 - 2, drawY + 8.5, 4, 1.5);
    // Green shirt
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + size / 2 - 4, drawY + 13, 8, 8);

    // Person 2 (Left - Yellow shirt)
    ctx.fillStyle = '#c58e65';
    ctx.beginPath();
    ctx.arc(x + size / 2 - 7, drawY + 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + size / 2 - 10, drawY + 14, 6, 7);

    // Person 3 (Right - Red shirt)
    ctx.fillStyle = '#9d633f';
    ctx.beginPath();
    ctx.arc(x + size / 2 + 7, drawY + 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + size / 2 + 4, drawY + 14, 6, 7);

    // Miniature waving Brazil flag
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + size / 2 + 6, drawY + 2, 7, 4.5);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(x + size / 2 + 9.5, drawY + 2);
    ctx.lineTo(x + size / 2 + 12.5, drawY + 4.25);
    ctx.lineTo(x + size / 2 + 9.5, drawY + 6.5);
    ctx.lineTo(x + size / 2 + 6.5, drawY + 4.25);
    ctx.fill();

    // Floating heart of joy above
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + size / 2 - 2, drawY + 1, 2, Math.PI, 0);
    ctx.arc(x + size / 2 + 2, drawY + 1, 2, Math.PI, 0);
    ctx.lineTo(x + size / 2, drawY + 5);
    ctx.fill();
  }

  // Alias for backward compatibility
  public static drawPicanha(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    floatOffset: number = 0
  ) {
    this.drawPovoFeliz(ctx, x, y, size, floatOffset);
  }

  /**
   * Incêndios em Florestas / Queimadas - Obstáculos de Fogo
   * Quando apagado pelo Lula Lançador de Água, vira muda de árvore florida!
   */
  public static drawForestFire(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    animTime: number,
    isExtinguished: boolean = false
  ) {
    ctx.save();
    if (isExtinguished) {
      // Blossoming green tree / sprout after water extinguishes the fire
      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + width / 2 - 3, y + height - 12, 6, 12);
      // Lush green foliage
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height - 18, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x + width / 2 - 4, y + height - 22, 9, 0, Math.PI * 2);
      ctx.fill();
      // Little flower blooming
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height - 26, 3, 0, Math.PI * 2);
      ctx.fill();
      // Water dew drops
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + width / 2 + 6, y + height - 14, 2, 2);
    } else {
      // Crackling Forest Fire Flames!
      const flameFlicker = Math.sin(animTime * 18 + x) * 3;
      const flameFlicker2 = Math.cos(animTime * 22 + x) * 2;

      // Charred burning logs at base
      ctx.fillStyle = '#3f1a04';
      ctx.fillRect(x + 2, y + height - 6, width - 4, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 6, y + height - 9, width - 12, 4);

      // Glowing ember heat
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height - 12, width / 2 + 4, 0, Math.PI * 2);
      ctx.fill();

      // Outer Red flame
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + height - 6);
      ctx.lineTo(x + width / 2 - 4, y + 2 + flameFlicker);
      ctx.lineTo(x + width / 2 + 2, y - 4 + flameFlicker2);
      ctx.lineTo(x + width - 4, y + height - 6);
      ctx.closePath();
      ctx.fill();

      // Mid Orange flame
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(x + 8, y + height - 6);
      ctx.lineTo(x + width / 2, y + 8 + flameFlicker);
      ctx.lineTo(x + width - 8, y + height - 6);
      ctx.closePath();
      ctx.fill();

      // Inner Bright Yellow core
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(x + 12, y + height - 6);
      ctx.lineTo(x + width / 2, y + 14 + flameFlicker2);
      ctx.lineTo(x + width - 12, y + height - 6);
      ctx.closePath();
      ctx.fill();

      // Leaping flying embers
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + width / 2 + Math.sin(animTime * 15) * 8, y - 6 + (Math.sin(animTime * 20) * 4), 2, 2);
      ctx.fillRect(x + width / 2 - 6 + Math.cos(animTime * 12) * 6, y - 2, 2, 2);
    }
    ctx.restore();
  }

  /**
   * Espinhos ao Alto / Teto de Espinhos Perigosos
   * Dificulta saltos desmedidos e voo livre nas partes superiores da fase!
   */
  public static drawCeilingSpikes(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    animTime: number
  ) {
    ctx.save();
    // 1. Base mount bar along ceiling
    ctx.fillStyle = '#334155'; // Dark industrial steel mount
    ctx.fillRect(x, y, width, 6);

    // Warning hazard stripes on mounting bar (yellow and black/red)
    const stripeW = 8;
    for (let sx = 0; sx < width; sx += stripeW * 2) {
      ctx.fillStyle = '#facc15'; // Yellow hazard stripe
      ctx.fillRect(x + sx, y + 1, stripeW, 4);
    }

    // Bolts on mount
    ctx.fillStyle = '#94a3b8';
    for (let bx = 4; bx < width; bx += 16) {
      ctx.fillRect(x + bx, y + 2, 2, 2);
    }

    // 2. Hanging triangular razor-sharp spikes
    const spikeWidth = 16;
    const numSpikes = Math.max(1, Math.floor(width / spikeWidth));
    const glintPhase = Math.floor((animTime * 3) % (numSpikes + 4));

    for (let i = 0; i < numSpikes; i++) {
      const spX = x + i * spikeWidth;
      const spMid = spX + spikeWidth / 2;
      const spTipY = y + height;
      const isGlinting = i === glintPhase;

      // Spike body
      ctx.fillStyle = isGlinting ? '#f8fafc' : '#64748b'; // Slate body or shiny white glint
      ctx.beginPath();
      ctx.moveTo(spX + 1, y + 6);
      ctx.lineTo(spMid, spTipY);
      ctx.lineTo(spX + spikeWidth - 1, y + 6);
      ctx.closePath();
      ctx.fill();

      // Shadowed right edge
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(spMid, spTipY);
      ctx.lineTo(spX + spikeWidth - 1, y + 6);
      ctx.lineTo(spMid, y + 6);
      ctx.closePath();
      ctx.fill();

      // Sharp highlight blade line down the center
      ctx.strokeStyle = isGlinting ? '#ffffff' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(spMid, y + 6);
      ctx.lineTo(spMid, spTipY);
      ctx.stroke();

      // Red danger warning point at tip
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(spMid - 1, spTipY - 3, 2, 3);
    }

    ctx.restore();
  }

  /**
   * Water Jet projectile stream (Mod Lula Lançador de Água)
   */
  public static drawWaterJet(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, animTime: number) {
    ctx.save();
    ctx.translate(x, y);
    // Outer splashing stream
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner cyan foam
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // White reflection bubbles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -1, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Trailing droplets
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(vx > 0 ? -12 : 10, -2, 3, 3);
    ctx.fillRect(vx > 0 ? -16 : 14, 2, 2, 2);
    ctx.restore();
  }

  /**
   * Giant Power Fist (Mod Marombeiro)
   */
  public static drawMusclePunch(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, animTime: number) {
    ctx.save();
    ctx.translate(x, y);
    if (vx < 0) ctx.scale(-1, 1);
    // Golden sonic boom shockwave
    ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    // Golden Giant Punching Fist
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-6, -8, 14, 16);
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(0, -6, 10, 12);
    // Knuckles
    ctx.fillStyle = '#b45309';
    ctx.fillRect(8, -6, 3, 3);
    ctx.fillRect(8, -2, 3, 3);
    ctx.fillRect(8, 2, 3, 3);
    ctx.fillRect(8, 6, 3, 3);
    ctx.restore();
  }

  /**
   * Diploma Universitário - Projétil / Suporte
   */
  public static drawDiploma(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    floatOffset: number = 0
  ) {
    const drawY = y + floatOffset;
    // Rolled parchment diploma
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x + 2, drawY + 4, size - 4, 14);

    // Red ribbon in center
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + size / 2 - 3, drawY + 2, 6, 18);

    // Gold seal
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x + size / 2, drawY + 11, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Barril do Pré-Sal - Recurso Especial de Infraestrutura
   */
  public static drawPreSal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    // Metal oil drum
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

    // Metal barrel rings
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 2, y + 6, size - 4, 2);
    ctx.fillRect(x + 2, y + size - 10, size - 4, 2);

    // Brazilian green/yellow diamond logo
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + 10);
    ctx.lineTo(x + size - 6, y + size / 2);
    ctx.lineTo(x + size / 2, y + size - 12);
    ctx.lineTo(x + 6, y + size / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + size / 2 - 2, y + size / 2 - 2, 4, 4);
  }

  /**
   * Apoio Popular / Votos (Estrela Moeda)
   */
  public static drawPopularidade(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    animTime: number
  ) {
    const spin = Math.cos(animTime * 8);
    const coinW = Math.max(4, Math.abs(spin) * size);
    const cx = x + size / 2 - coinW / 2;

    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx, y + 2, coinW, size - 4);

    // Red star in center
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx + 2, y + size / 2 - 2, Math.max(1, coinW - 4), 4);

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, y + 2, coinW, size - 4);
  }

  /**
   * Discurso Emocional Projectiles (Hearts, Gears, Books)
   */
  public static drawDiscursoProjectile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 'heart' | 'gear' | 'book',
    animTime: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    if (type === 'heart') {
      // Pulsing red heart
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-4, -2, 4, Math.PI, 0);
      ctx.arc(4, -2, 4, Math.PI, 0);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'gear') {
      // Golden gear
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -2, 4, 4);
    } else {
      // Blue education book
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-6, -5, 12, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -4, 8, 8);
    }

    ctx.restore();
  }

  /**
   * Enemies:
   * 1. Censor Burocrata (Regime / Censura)
   * 2. Especulador Financeiro (Crise)
   * 3. Laranja (Esquema)
   * 4. Mínion (Patriota fanático com camisa amarela)
   * 5. Fantasma (Fake News)
   */
  public static drawEnemy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    type: 'censor' | 'especulador' | 'orange' | 'minion' | 'ghost' | 'boi',
    frame: number,
    isSquished: boolean
  ) {
    ctx.save();
    const s = 2;
    const ox = x;
    const oy = y;

    if (isSquished) {
      if (type === 'boi') {
        // Squished flat ox with horns poking out
        ctx.fillStyle = '#78350f';
        ctx.fillRect(ox, oy + height - 8, width, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(ox - 3, oy + height - 12, 5, 5);
        ctx.fillRect(ox + width - 2, oy + height - 12, 5, 5);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(ox, oy + height - 8, width, 8);
      }
      ctx.restore();
      return;
    }

    if (type === 'boi') {
      // O Boi / Gado Patriota: Inimigo bovino com chifres grandes, focinho, fita verde-amarela e cascos trotando!
      const trot = Math.sin(frame * 12) * 1.5;
      const tailWag = Math.sin(frame * 16) * 3;

      // Rabinho de boi com tufo de pelos
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox + 4, oy + 12 + trot);
      ctx.lineTo(ox - 4, oy + 8 + trot + tailWag);
      ctx.stroke();
      ctx.fillStyle = '#451a03';
      ctx.fillRect(ox - 6, oy + 7 + trot + tailWag, 4, 3);

      // Corpo robusto marrom do boi
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(ox + 4, oy + 6 + trot, width - 10, 14, [4, 4, 2, 2]);
      ctx.fill();

      // Mancha dorsal mais clara
      ctx.fillStyle = '#92400e';
      ctx.fillRect(ox + 9, oy + 8 + trot, 7, 5);

      // Fita / Faixa Verde e Amarela nas costas
      ctx.fillStyle = '#15803d';
      ctx.fillRect(ox + 16, oy + 6 + trot, 5, 14);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox + 18, oy + 8 + trot, 2, 10);

      // Cabeça bovina
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.roundRect(ox + width - 16, oy + 2 + trot, 14, 15, [4, 4, 4, 4]);
      ctx.fill();

      // Chifres curvos e pontudos de boi (marfim com pontas afiadas)
      ctx.fillStyle = '#fef08a';
      // Chifre de trás
      ctx.beginPath();
      ctx.moveTo(ox + width - 13, oy + 3 + trot);
      ctx.lineTo(ox + width - 17, oy - 7 + trot);
      ctx.lineTo(ox + width - 10, oy - 2 + trot);
      ctx.closePath();
      ctx.fill();
      // Chifre da frente
      ctx.beginPath();
      ctx.moveTo(ox + width - 4, oy + 3 + trot);
      ctx.lineTo(ox + width + 1, oy - 7 + trot);
      ctx.lineTo(ox + width - 2, oy - 2 + trot);
      ctx.closePath();
      ctx.fill();

      // Pontas dos chifres douradas
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(ox + width - 17, oy - 7 + trot, 2, 2);
      ctx.fillRect(ox + width, oy - 7 + trot, 2, 2);

      // Orelhas de boi caídas
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + width - 18, oy + 5 + trot, 4, 3);
      ctx.fillRect(ox + width - 2, oy + 5 + trot, 4, 3);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(ox + width - 17, oy + 6 + trot, 2, 1.5);

      // Olhos caricatos esbugalhados
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + width - 11, oy + 5 + trot, 4, 4);
      ctx.fillRect(ox + width - 5, oy + 5 + trot, 4, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + width - 12, oy + 6 + trot, 2, 2);
      ctx.fillRect(ox + width - 6, oy + 6 + trot, 2, 2);

      // Grande focinho rosa/bege
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.roundRect(ox + width - 12, oy + 10 + trot, 12, 8, [3, 3, 3, 3]);
      ctx.fill();

      // Narinas
      ctx.fillStyle = '#451a03';
      ctx.fillRect(ox + width - 10, oy + 12 + trot, 2, 2);
      ctx.fillRect(ox + width - 4, oy + 12 + trot, 2, 2);

      // Argola dourada no focinho
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox + width - 7, oy + 16 + trot, 3, 0, Math.PI);
      ctx.stroke();

      // 4 Patas trotando com cascos
      const walk = Math.floor(frame * 8) % 2;
      ctx.fillStyle = '#78350f';
      // Patas dianteiras
      ctx.fillRect(ox + width - 12, oy + 19 + trot, 4, 5 - (walk ? 2 : 0));
      ctx.fillRect(ox + width - 6, oy + 19 + trot, 4, 5 - (walk ? 0 : 2));
      // Patas traseiras
      ctx.fillRect(ox + 6, oy + 19 + trot, 4, 5 - (walk ? 0 : 2));
      ctx.fillRect(ox + 12, oy + 19 + trot, 4, 5 - (walk ? 2 : 0));

      // Cascos pretos
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + width - 12, oy + 24 + trot - (walk ? 2 : 0), 4, 3);
      ctx.fillRect(ox + width - 6, oy + 24 + trot - (walk ? 0 : 2), 4, 3);
      ctx.fillRect(ox + 6, oy + 24 + trot - (walk ? 0 : 2), 4, 3);
      ctx.fillRect(ox + 12, oy + 24 + trot - (walk ? 2 : 0), 4, 3);

    } else if (type === 'orange') {
      // Angry round orange
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(ox + width / 2, oy + height / 2, width / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      // Green stem
      ctx.fillStyle = '#15803d';
      ctx.fillRect(ox + width / 2 - 2, oy + 2, 4, 4);
      // Angry eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 4, oy + 8, 4, 4);
      ctx.fillRect(ox + 16, oy + 8, 4, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(ox + 6, oy + 9, 2, 3);
      ctx.fillRect(ox + 18, oy + 9, 2, 3);
    } else if (type === 'minion') {
      // Yellow minion / patriota with round goggles & green/yellow shirt
      const bob = Math.sin(frame * 8) * 1.5;
      // Yellow body
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(ox + width / 2, oy + height / 2 + bob - 2, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Goggles strap & lenses
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox + 2, oy + 7 + bob, width - 4, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(ox + width / 2 - 4, oy + 8 + bob, 4, 0, Math.PI * 2);
      ctx.arc(ox + width / 2 + 4, oy + 8 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ox + width / 2 - 4, oy + 8 + bob, 2.5, 0, Math.PI * 2);
      ctx.arc(ox + width / 2 + 4, oy + 8 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + width / 2 - 4, oy + 8 + bob, 1.5, 1.5);
      ctx.fillRect(ox + width / 2 + 4, oy + 8 + bob, 1.5, 1.5);
      // Green collar / shirt
      ctx.fillStyle = '#15803d';
      ctx.fillRect(ox + 5, oy + height - 10 + bob, width - 10, 6);
    } else if (type === 'ghost') {
      // Translucent floating ghost of fake news
      const floatY = Math.sin(frame * 6) * 3;
      ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.beginPath();
      ctx.arc(ox + width / 2, oy + 10 + floatY, 10, Math.PI, 0);
      ctx.lineTo(ox + width - 4, oy + height - 4 + floatY);
      // Wavy ghost skirt
      ctx.lineTo(ox + width - 9, oy + height - 8 + floatY);
      ctx.lineTo(ox + width / 2, oy + height - 4 + floatY);
      ctx.lineTo(ox + 9, oy + height - 8 + floatY);
      ctx.lineTo(ox + 4, oy + height - 4 + floatY);
      ctx.closePath();
      ctx.fill();
      // Red eyes
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ox + 8, oy + 8 + floatY, 3, 3);
      ctx.fillRect(ox + 16, oy + 8 + floatY, 3, 3);
    } else if (type === 'censor') {
      // Grey uniform bureaucrat with stamp
      ctx.fillStyle = '#475569';
      ctx.fillRect(ox + 3 * s, oy + 8 * s, 10 * s, 10 * s);
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(ox + 4 * s, oy + 2 * s, 8 * s, 7 * s);
      // Dark glasses
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + 5 * s, oy + 4 * s, 6 * s, 2 * s);
      // Censorship Red Stamp
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ox + 12 * s, oy + 10 * s, 4 * s, 6 * s);
    } else {
      // Speculator in pinstripe dark suit
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + 3 * s, oy + 8 * s, 10 * s, 10 * s);
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(ox + 4 * s, oy + 2 * s, 8 * s, 7 * s);
      // Top hat
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(ox + 3 * s, oy + 0 * s, 10 * s, 4 * s);
      // Briefcase
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + 12 * s, oy + 12 * s, 5 * s, 5 * s);
    }

    // Walking legs for biped enemies
    if (type !== 'ghost' && type !== 'boi' && type !== 'orange') {
      const walk = Math.floor(frame * 6) % 2;
      ctx.fillStyle = '#1e293b';
      if (walk === 0) {
        ctx.fillRect(ox + 4 * s, oy + 18 * s, 3 * s, 5 * s);
        ctx.fillRect(ox + 9 * s, oy + 18 * s, 3 * s, 5 * s);
      } else {
        ctx.fillRect(ox + 3 * s, oy + 18 * s, 3 * s, 5 * s);
        ctx.fillRect(ox + 10 * s, oy + 18 * s, 3 * s, 5 * s);
      }
    }

    ctx.restore();
  }

  /**
   * Stage Bosses Renderer:
   * 1. 'laranja' -> O Grande Laranjão (Fase 1)
   * 2. 'fantasma' -> O Fantasma da Censura (Fase 2)
   * 3. 'patriota' -> O Mínion do Caminhão (Fase 3)
   * 4. 'general' -> O General Autoritário (Fase 4)
   * 5. 'palhaco' -> O Palhaço Bozo (Fase 5 - Boss Final)
   */
  public static drawBoss(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    type: 'laranja' | 'fantasma' | 'patriota' | 'general' | 'palhaco',
    hp: number,
    maxHp: number,
    frame: number,
    isHit: boolean
  ) {
    ctx.save();
    const ox = x;
    const oy = y;

    // Flash white/red when taking hit
    if (isHit && Math.floor(frame * 20) % 2 === 0) {
      ctx.filter = 'brightness(2) drop-shadow(0 0 10px #dc2626)';
    }

    if (type === 'laranja') {
      // O Grande Laranjão: Huge round mafia orange boss with fedora and cigar!
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(ox + width / 2, oy + height / 2 + 4, width / 2 - 4, 0, Math.PI * 2);
      ctx.fill();

      // Fedora hat on top
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(ox + 4, oy + 4, width - 8, 8); // Hat brim
      ctx.fillRect(ox + 14, oy - 10, width - 28, 16); // Hat crown
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ox + 14, oy + 2, width - 28, 3); // Hat red band

      // Dark sunglasses
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + 12, oy + 18, 16, 10);
      ctx.fillRect(ox + 34, oy + 18, 16, 10);
      ctx.fillRect(ox + 28, oy + 21, 6, 4);

      // Gold chain necklace
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ox + width / 2, oy + 38, 16, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Cigar
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + width / 2 + 4, oy + 32, 14, 4);
      ctx.fillStyle = '#dc2626'; // glowing tip
      ctx.fillRect(ox + width / 2 + 16, oy + 32, 3, 4);

    } else if (type === 'fantasma') {
      // O Fantasma da Censura / Fake News: Huge spooky phantom
      const sway = Math.sin(frame * 5) * 5;
      ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
      ctx.beginPath();
      ctx.arc(ox + width / 2, oy + 20 + sway, 24, Math.PI, 0);
      ctx.lineTo(ox + width - 6, oy + height - 8 + sway);
      ctx.lineTo(ox + width - 18, oy + height - 16 + sway);
      ctx.lineTo(ox + width / 2, oy + height - 8 + sway);
      ctx.lineTo(ox + 18, oy + height - 16 + sway);
      ctx.lineTo(ox + 6, oy + height - 8 + sway);
      ctx.closePath();
      ctx.fill();

      // Spooky red glowing eyes
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(ox + width / 2 - 10, oy + 18 + sway, 5, 0, Math.PI * 2);
      ctx.arc(ox + width / 2 + 10, oy + 18 + sway, 5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(ox + width / 2, oy + 28 + sway, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smartphones orbiting
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox - 6, oy + 15 + sway, 10, 16);
      ctx.fillRect(ox + width - 4, oy + 20 + sway, 10, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(ox - 5, oy + 17 + sway, 8, 12);
      ctx.fillRect(ox - 3 + width, oy + 22 + sway, 8, 12);

    } else if (type === 'patriota') {
      // O Mínion do Caminhão: Minion boss clinging to truck grille / tire
      ctx.fillStyle = '#facc15'; // Yellow body
      ctx.beginPath();
      ctx.ellipse(ox + width / 2, oy + height / 2 - 4, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Green & yellow shirt
      ctx.fillStyle = '#15803d';
      ctx.fillRect(ox + 12, oy + height / 2 + 6, width - 24, 16);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox + 20, oy + height / 2 + 9, width - 40, 10);

      // Huge goggles
      ctx.fillStyle = '#334155';
      ctx.fillRect(ox + 8, oy + 16, width - 16, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(ox + width / 2 - 9, oy + 18, 9, 0, Math.PI * 2);
      ctx.arc(ox + width / 2 + 9, oy + 18, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ox + width / 2 - 9, oy + 18, 6, 0, Math.PI * 2);
      ctx.arc(ox + width / 2 + 9, oy + 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + width / 2 - 10, oy + 17, 3, 3);
      ctx.fillRect(ox + width / 2 + 8, oy + 17, 3, 3);

      // Big truck tire / grill at bottom
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(ox + width / 2, oy + height - 6, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.stroke();

    } else if (type === 'general') {
      // O General Autoritário / Extremista: Military dictator boss with peaked cap, medals and swagger stick
      ctx.fillStyle = '#334155'; // Dark military uniform
      ctx.fillRect(ox + 10, oy + 22, width - 20, height - 28);

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(ox + 16, oy + 8, width - 32, 16);

      // Peaked Cap (Quepe Militar)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox + 10, oy + 2, width - 20, 8);
      ctx.fillRect(ox + 6, oy + 8, width - 12, 4); // Visor
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox + width / 2 - 3, oy + 4, 6, 4); // Gold insignia

      // Dark shades
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + 16, oy + 14, 12, 5);
      ctx.fillRect(ox + 34, oy + 14, 12, 5);
      ctx.fillRect(ox + 28, oy + 15, 6, 3);

      // Medals on chest
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ox + 14, oy + 28, 5, 5);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox + 21, oy + 28, 5, 5);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(ox + 28, oy + 28, 5, 5);

      // Red armband
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ox + width - 12, oy + 26, 8, 8);

    } else if (type === 'palhaco') {
      // O Palhaço Bozo (Final Boss): Colorful crazy clown with red nose, rainbow wig & oversized bowtie!
      const jumpBob = Math.sin(frame * 10) * 3;

      // Colorful suit
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(ox + 12, oy + 24 + jumpBob, width - 24, height - 32);

      // Huge red and yellow polka dots
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(ox + 20, oy + 32 + jumpBob, 3, 0, Math.PI * 2);
      ctx.arc(ox + 38, oy + 40 + jumpBob, 4, 0, Math.PI * 2);
      ctx.fill();

      // Head with white clown face paint
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 14, oy + 6 + jumpBob, width - 28, 20);

      // Rainbow / Curly clown wig (Sides)
      ctx.fillStyle = '#dc2626'; // Red wig left
      ctx.beginPath();
      ctx.arc(ox + 10, oy + 12 + jumpBob, 8, 0, Math.PI * 2);
      ctx.arc(ox + 12, oy + 6 + jumpBob, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316'; // Orange/blue wig right
      ctx.beginPath();
      ctx.arc(ox + width - 10, oy + 12 + jumpBob, 8, 0, Math.PI * 2);
      ctx.arc(ox + width - 12, oy + 6 + jumpBob, 7, 0, Math.PI * 2);
      ctx.fill();

      // Big red clown nose!
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(ox + width / 2, oy + 16 + jumpBob, 5, 0, Math.PI * 2);
      ctx.fill();

      // Huge red smile
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(ox + width / 2, oy + 20 + jumpBob, 8, 0, Math.PI);
      ctx.fill();

      // Blue eyes
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(ox + width / 2 - 8, oy + 11 + jumpBob, 3, 3);
      ctx.fillRect(ox + width / 2 + 5, oy + 11 + jumpBob, 3, 3);

      // Giant yellow bow tie
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(ox + width / 2 - 14, oy + 26 + jumpBob);
      ctx.lineTo(ox + width / 2, oy + 29 + jumpBob);
      ctx.lineTo(ox + width / 2 - 14, oy + 34 + jumpBob);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ox + width / 2 + 14, oy + 26 + jumpBob);
      ctx.lineTo(ox + width / 2, oy + 29 + jumpBob);
      ctx.lineTo(ox + width / 2 + 14, oy + 34 + jumpBob);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ox + width / 2 - 2, oy + 27 + jumpBob, 4, 5);
    }

    ctx.restore();
  }

  /**
   * Draws the Boss Health Bar on top of the Screen
   */
  public static drawBossHUD(
    ctx: CanvasRenderingContext2D,
    width: number,
    bossName: string,
    hp: number,
    maxHp: number
  ) {
    ctx.save();
    const barWidth = 220;
    const barHeight = 12;
    const x = width / 2 - barWidth / 2;
    const y = 48;

    // Boss Name Tag
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`⚡ CHEFE: ${bossName}`, width / 2, y - 6);

    // Frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

    // Health Fill
    const fillW = Math.max(0, (hp / maxHp) * barWidth);
    ctx.fillStyle = hp > 1 ? '#ef4444' : '#eab308';
    ctx.fillRect(x, y, fillW, barHeight);

    // Heart icons inside
    ctx.font = '8px monospace';
    ctx.fillStyle = '#ffffff';
    let hearts = '';
    for (let i = 0; i < hp; i++) hearts += '♥';
    ctx.fillText(hearts, width / 2, y + 9);

    ctx.restore();
  }

  /**
   * Question Block '?' with golden star shimmer
   */
  public static drawQuestionBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    isUsed: boolean,
    animTime: number,
    bumpOffset: number = 0
  ) {
    const drawY = y - bumpOffset;
    if (isUsed) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, drawY, size, size);
      ctx.fillStyle = '#334155';
      ctx.strokeRect(x + 1, drawY + 1, size - 2, size - 2);
      return;
    }

    const shimmer = Math.sin(animTime * 5) > 0;
    ctx.fillStyle = shimmer ? '#f59e0b' : '#d97706';
    ctx.fillRect(x, drawY, size, size);

    // Highlight
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 2, drawY + 2, size - 4, 3);
    ctx.fillRect(x + 2, drawY + 2, 3, size - 4);

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, drawY + 1, size - 2, size - 2);

    // Animated Star / '?' symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', x + size / 2, drawY + size / 2 + 1);
  }

  /**
   * Destructible Brick Block (Quebra de correntes burocráticas)
   */
  public static drawBrickBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    bumpOffset: number = 0
  ) {
    const drawY = y - bumpOffset;
    ctx.fillStyle = '#b91c1c'; // Red brick
    ctx.fillRect(x, drawY, size, size);

    // Mortar lines
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(x, drawY + size / 2 - 1, size, 2);
    ctx.fillRect(x + size / 2 - 1, drawY, 2, size / 2);
    ctx.fillRect(x + size / 4 - 1, drawY + size / 2, 2, size / 2);

    ctx.strokeStyle = '#2d0606';
    ctx.strokeRect(x, drawY, size, size);
  }

  /**
   * Ground Block with Grass Top
   */
  public static drawGroundBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    hasGrassTop: boolean
  ) {
    ctx.fillStyle = '#7c3f1d';
    ctx.fillRect(x, y, size, size);

    // Specks
    ctx.fillStyle = '#5c2d14';
    ctx.fillRect(x + 4, y + 8, 4, 4);
    ctx.fillRect(x + 18, y + 18, 4, 4);

    ctx.strokeStyle = '#431f0b';
    ctx.strokeRect(x, y, size, size);

    if (hasGrassTop) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x, y, size, 7);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(x, y, size, 2);
    }
  }

  /**
   * Goal Pole & Brazilian / Presidential Banner
   */
  public static drawGoalPole(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    flagY: number
  ) {
    // Metal pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 2, y, 4, height - 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 3, y, 2, height - 8);

    // Gold Star Top
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x + 4, y - 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Flag: Green/Yellow with Red Star Center
    const currentFlagY = Math.min(y + height - 36, Math.max(y, flagY));
    const flagW = 32;
    const flagH = 22;

    ctx.fillStyle = '#15803d'; // Green
    ctx.fillRect(x + 6, currentFlagY, flagW, flagH);

    // Yellow rhombus
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(x + 6 + flagW / 2, currentFlagY + 2);
    ctx.lineTo(x + 6 + flagW - 3, currentFlagY + flagH / 2);
    ctx.lineTo(x + 6 + flagW / 2, currentFlagY + flagH - 2);
    ctx.lineTo(x + 6 + 3, currentFlagY + flagH / 2);
    ctx.closePath();
    ctx.fill();

    // Red star in center
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x + 6 + flagW / 2, currentFlagY + flagH / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Background scenery according to historical era:
   * 1. 'abc': Metalúrgica do ABC, chaminés industriais, greves operárias
   * 2. 'comicio': Comício das Diretas Já, mar de bandeiras, palanques
   * 3. 'planalto': Brasília, Congresso Nacional, Palácio do Planalto
   */
  public static drawBackground(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    canvasW: number,
    canvasH: number,
    animTime: number,
    theme: 'abc' | 'comicio' | 'planalto'
  ) {
    if (theme === 'abc') {
      // Industrial Twilight / Morning over ABC Paulista
      ctx.fillStyle = '#38bdf8'; // Sky
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Industrial Smog / Factory Silhouettes
      const fOffset = (cameraX * 0.2) % 900;
      ctx.fillStyle = '#475569';
      // Chimneys & factory sheds
      ctx.fillRect(60 - fOffset, canvasH - 180, 180, 120);
      ctx.fillRect(100 - fOffset, canvasH - 250, 30, 90); // Chimney 1
      ctx.fillRect(200 - fOffset, canvasH - 230, 24, 70); // Chimney 2

      ctx.fillRect(450 - fOffset, canvasH - 190, 220, 130);
      ctx.fillRect(520 - fOffset, canvasH - 260, 35, 90);

      // Smoke puffs from chimneys
      ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
      const s1 = Math.sin(animTime * 3) * 6;
      ctx.beginPath();
      ctx.arc(115 - fOffset + s1, canvasH - 265, 14, 0, Math.PI * 2);
      ctx.arc(537 - fOffset + s1, canvasH - 275, 16, 0, Math.PI * 2);
      ctx.fill();

      // Factory banners: "GREVE GERAL - ABC 1979"
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(240 - fOffset, canvasH - 130, 140, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('GREVE ABC 1979', 246 - fOffset, canvasH - 114);

    } else if (theme === 'comicio') {
      // Diretas Já Sunset / Yellow & Red rally
      ctx.fillStyle = '#f97316'; // Sunset orange
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Crowd silhouettes waving flags in background
      const cOffset = (cameraX * 0.3) % 800;
      ctx.fillStyle = '#1e1b4b'; // Crowd dark silhouette
      ctx.beginPath();
      ctx.moveTo(0, canvasH - 60);
      for (let i = 0; i < 20; i++) {
        const h = 40 + Math.sin(i * 1.5 + animTime * 4) * 8;
        ctx.lineTo(i * 45 - cOffset, canvasH - h);
      }
      ctx.lineTo(canvasW, canvasH);
      ctx.lineTo(0, canvasH);
      ctx.fill();

      // Floating flags
      for (let i = 0; i < 8; i++) {
        const fx = (i * 120 - cOffset + canvasW) % canvasW;
        ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#facc15';
        ctx.fillRect(fx, canvasH - 120 + Math.sin(animTime * 4 + i) * 6, 20, 14);
      }

    } else {
      // Planalto / Brasília: Bright Blue Capital Sky & Niemeyer Architecture
      ctx.fillStyle = '#60a5fa'; // Clear Blue Sky
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Fluffy white clouds
      this.drawCloud(ctx, (100 - cameraX * 0.15) % 800, 60, 1.2);
      this.drawCloud(ctx, (500 - cameraX * 0.15) % 800, 80, 1.0);

      // Iconic Congresso Nacional Silhouette (Two Towers & Two Bowls)
      const bOffset = (cameraX * 0.25) % 1000;
      const bx = 260 - bOffset;
      const by = canvasH - 180;

      ctx.fillStyle = '#ffffff'; // White marble
      // Twin Towers
      ctx.fillRect(bx + 40, by - 60, 20, 80);
      ctx.fillRect(bx + 64, by - 60, 20, 80);
      ctx.fillRect(bx + 40, by - 30, 44, 10); // Connecting bridge

      // Senate Dome (Convex Bowl)
      ctx.beginPath();
      ctx.arc(bx + 18, by + 10, 20, Math.PI, 0);
      ctx.fill();

      // Chamber of Deputies Dome (Concave Bowl)
      ctx.beginPath();
      ctx.arc(bx + 110, by + 10, 20, 0, Math.PI);
      ctx.fill();

      // Base Platform
      ctx.fillRect(bx - 10, by + 10, 150, 16);

      // Green Lawns of Esplanada
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, canvasH - 70, canvasW, 20);
    }
  }

  private static drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 10, 80, 24);
    ctx.fillRect(12, 0, 32, 16);
    ctx.fillRect(36, 4, 30, 20);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 30, 80, 6);

    ctx.restore();
  }
}
