namespace SpriteKind {
    export const Cursor = SpriteKind.create()
    export const Wand = SpriteKind.create()
    export const Shrine = SpriteKind.create()
    export const Falling_enemy = SpriteKind.create()
}
function spawn_shrines () {
    for (let location of tiles.getTilesByType(myTiles.tile2)) {
        shrine_sprite = sprites.create(assets.image`shrine`, SpriteKind.Shrine)
        sprites.setDataNumber(shrine_sprite, "lives", 3)
        shrine_sprite.scale = 0.25
        tiles.placeOnTile(shrine_sprite, location)
        shrine_sprite.bottom = tilesAdvanced.getTilemapHeight() * 15
        tiles.setTileAt(location, myTiles.transparency16)
    }
}
function wand_behaviour () {
    aim_angle = spriteutils.angleFrom(wand, cursor_sprite)
    aim_angle = spriteutils.radiansToDegrees(aim_angle)
    transformSprites.rotateSprite(wand, aim_angle)
    wand.setPosition(me.x, me.y)
}
function bat_fall (bat: Sprite) {
    animation.stopAnimation(animation.AnimationTypes.All, bat)
    bat.image.flipY()
    bat.follow(me, 0)
    bat.vy = -40
    bat.ay = 150
    bat.setKind(SpriteKind.Falling_enemy)
}
function spawn_player () {
    tiles.placeOnRandomTile(me, myTiles.tile4)
    tiles.setTileAt(me.tilemapLocation(), myTiles.transparency16)
}
browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x, y) {
    fire_angle = spriteutils.angleFrom(wand, cursor_sprite)
    for (let index = 0; index < 30; index++) {
        proj = sprites.create(assets.image`blast`, SpriteKind.Projectile)
        spriteutils.placeAngleFrom(
        proj,
        fire_angle,
        10,
        wand
        )
        spriteutils.setVelocityAtAngle(proj, fire_angle, 150)
        proj.startEffect(effects.trail)
        fire_angle += spriteutils.degreesToRadians(3)
    }
    timer.background(function () {
        music.play(music.stringPlayable("G G G G G G G G ", 120), music.PlaybackMode.UntilDone)
    })
})
scene.onHitWall(SpriteKind.Falling_enemy, function (sprite, location) {
    sprites.destroy(sprite)
})
function spawn_bats () {
    for (let index = 0; index < spawn_count; index++) {
        bat = sprites.create(assets.image`bat`, SpriteKind.Enemy)
        tiles.placeOnRandomTile(bat, myTiles.tile1)
        animation.runImageAnimation(
        bat,
        assets.animation`bat flight`,
        50,
        true
        )
        shrines = sprites.allOfKind(SpriteKind.Shrine)
        bat.follow(shrines._pickRandom(), randint(5, 25))
    }
    timer.after(spawn_timer, function () {
        spawn_bats()
    })
}
browserEvents.onMouseMove(function (x, y) {
    mouse_x = x
    mouse_y = y
})
function position_cursor () {
    x_offset = scene.cameraProperty(CameraProperty.Left)
    y_offset = scene.cameraProperty(CameraProperty.Top)
    cursor_sprite.x = mouse_x + x_offset
    cursor_sprite.y = mouse_y + y_offset
}
sprites.onOverlap(SpriteKind.Shrine, SpriteKind.Enemy, function (shrine, bat) {
    new_lives = sprites.readDataNumber(shrine, "lives") - 1
    if (new_lives < 1) {
        shrine.destroy()
        if (sprites.allOfKind(SpriteKind.Shrine).length < 1) {
            game.over(false)
        }
    } else {
        sprites.setDataNumber(shrine, "lives", new_lives)
    }
    bat.destroy()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (proj, bat) {
    bat_fall(bat)
    info.changeScoreBy(10)
    proj.destroy()
})
scene.onHitWall(SpriteKind.Projectile, function (sprite, location) {
    sprites.destroy(sprite)
})
let new_lives = 0
let y_offset = 0
let x_offset = 0
let mouse_y = 0
let mouse_x = 0
let shrines: Sprite[] = []
let bat: Sprite = null
let proj: Sprite = null
let fire_angle = 0
let aim_angle = 0
let shrine_sprite: Sprite = null
let wand: Sprite = null
let me: Sprite = null
let cursor_sprite: Sprite = null
let spawn_timer = 0
let spawn_count = 0
spawn_count = 6
spawn_timer = 10000
cursor_sprite = sprites.create(image.create(1, 1), SpriteKind.Cursor)
me = sprites.create(assets.image`player`, SpriteKind.Player)
wand = sprites.create(assets.image`wand`, SpriteKind.Wand)
me.z = -1
wand.z = -1
controller.moveSprite(me, 100, 0)
scene.cameraFollowSprite(me)
tiles.setCurrentTilemap(tilemap`level`)
spawn_player()
spawn_shrines()
scene.setBackgroundImage(assets.image`myImage1`)
scroller.scrollBackgroundWithCamera(scroller.CameraScrollMode.OnlyHorizontal)
timer.after(1000, function () {
    spawn_bats()
})
game.onUpdate(function () {
    position_cursor()
    wand_behaviour()
})
