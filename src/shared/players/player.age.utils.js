// src/shared/players/player.age.utils.js

export const getPlayerAge = (player, now = new Date()) => {
  const birthDay = String(player?.birthDay || '').trim()
  const birth = String(player?.birth || '').trim()

  const calcFromBirthDay = () => {
    const m = birthDay.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!m) return null

    const day = Number(m[1])
    const month = Number(m[2])
    const year = Number(m[3])

    if (!day || !month || !year) return null

    let age = now.getFullYear() - year

    const hasHadBirthdayThisYear =
      now.getMonth() + 1 > month ||
      (now.getMonth() + 1 === month && now.getDate() >= day)

    if (!hasHadBirthdayThisYear) age -= 1

    return age >= 0 ? age : null
  }

  const calcFromBirth = () => {
    const m = birth.match(/^(\d{2})-(\d{4})$/)
    if (!m) return null

    const month = Number(m[1])
    const year = Number(m[2])

    if (!month || month < 1 || month > 12 || !year) return null

    let age = now.getFullYear() - year
    if (now.getMonth() + 1 < month) age -= 1

    return age >= 0 ? age : null
  }

  return calcFromBirthDay() ?? calcFromBirth()
}
